using API.Extensions;
using API.SignalR;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Core.Entities.OrderAggregate;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Stripe;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController(IPaymentService paymentService, IUnitOfWork unit, ILogger<PaymentsController> logger, IConfiguration config, IHubContext<NotificationHub> hubContext) : BaseApiController
    {
        private readonly string _whSecret = config["StripeSettings:WhSecret"]!;

        [Authorize]
        [HttpPost("{cartId}")]
        public async Task<ActionResult<ShoppingCart>> CreateOrUpdatePaymentIntent(string cartId)
        {
            var cart = await paymentService.CreateOrUpdatePaymentIntent(cartId);

            if (cart == null) return BadRequest("Problem with your cart");

            return Ok(cart);
        }

        [HttpGet("delivery-methods")]
        public async Task<ActionResult<IReadOnlyList<DeliveryMethod>>> GetDeliveryMethods()
        {
            return Ok(await unit.Repository<DeliveryMethod>().ListAllAsync());
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(Request.Body).ReadToEndAsync();
            logger.LogInformation($"Webhook payload received: {json}");

            try
            {
                var stripeEvent = ConstructStripeEvent(json);
                logger.LogInformation($"Stripe event type: {stripeEvent.Type}");

                if (stripeEvent.Data.Object is not PaymentIntent intent)
                {
                    logger.LogError("Event object is not a PaymentIntent");
                    return BadRequest("Invalid event data");
                }

                logger.LogInformation($"Processing PaymentIntent: {intent.Id}");
                logger.LogInformation($"PaymentIntent amount: {intent.Amount}");
                logger.LogInformation($"PaymentIntent status: {intent.Status}");

                await HandlePaymentIntentSucceeded(intent);
                return Ok();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Webhook processing failed");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        private async Task HandlePaymentIntentSucceeded(PaymentIntent intent)
        {
            if (intent.Status == "succeeded")
            {
                var spec = new OrderSpecification(intent.Id, true);

                var order = await unit.Repository<Core.Entities.OrderAggregate.Order>().GetEntityWithSpec(spec) ?? throw new Exception("Order not found");

                if ((long)order.GetTotal() * 100 != intent.Amount)
                {
                    order.Status = OrderStatus.PaymentMismatch;
                }
                else
                {
                    order.Status = OrderStatus.PaymentReceived;
                }

                await unit.Complete();

                var connectionId = NotificationHub.GetConnectionIdByEmail(order.BuyerEmail);

                if (!string.IsNullOrEmpty(connectionId))
                {
                    await hubContext.Clients.Client(connectionId).SendAsync("OrderCompleteNotification", order.ToDto());
                }
            }
        }

        private Event ConstructStripeEvent(string json)
        {
            try
            {
                return EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    _whSecret,
                    throwOnApiVersionMismatch: false  // Add this parameter
                );
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to construct stripe event");
                throw new StripeException("Invalid signature");
            }
        }

    }
}
