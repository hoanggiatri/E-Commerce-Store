using System;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class FallBackController : Controller
{
    public IActionResult Index()
    {
        return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(),
            "wwwroot", "browser", "index.html"), "text/HTML");
    }
}
