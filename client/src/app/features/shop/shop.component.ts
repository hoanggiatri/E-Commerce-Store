import { Component, inject, InjectionToken, OnInit } from '@angular/core';
import { ShopService } from '../../core/services/shop.service';
import { Product } from '../../shared/models/product';
import { MatCard } from '@angular/material/card';
import { ProductItemComponent } from './product-item/product-item.component';
import { MatDialog } from '@angular/material/dialog';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import {
  MatListModule,
  MatListOption,
  MatSelectionList,
  MatSelectionListChange,
} from '@angular/material/list';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ShopParams } from '../../shared/models/shopParams';
import { Pagination } from '../../shared/models/pagination';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

export const SELECTION_LIST_TOKEN = new InjectionToken<any>('SelectionList');
@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    ProductItemComponent,
    MatButton,
    MatIcon,
    MatMenuTrigger,
    MatMenu,
    MatListModule,
    MatSelectionList,
    MatListOption,
    MatPaginator,
    FormsModule,
    EmptyStateComponent,
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
  providers: [
    { provide: SELECTION_LIST_TOKEN, useValue: [] }, // Provide the token here with an appropriate value
  ],
})
export class ShopComponent implements OnInit {
  private ShopService = inject(ShopService);
  private dialogService = inject(MatDialog);
  products?: Pagination<Product>;
  sortOptions = [
    { name: 'Alphabetical', value: 'name' },
    { name: 'Price: Low to High', value: 'priceAsc' },
    { name: 'Price: High to Low', value: 'priceDesc' },
  ];

  shopParams = new ShopParams();
  pageSizeOptions = [5, 10, 15, 20];

  ngOnInit(): void {
    this.initializeShop();
  }

  initializeShop() {
    this.ShopService.getTypes();
    this.ShopService.getBrands();
    this.getProducts();
  }

  resetFilters() {
    this.shopParams = new ShopParams();
    this.getProducts();
  }

  getProducts() {
    this.ShopService.getProducts(this.shopParams).subscribe({
      next: (response) => (this.products = response),
      error: (error) => console.error(error),
    });
  }

  onSearchChange() {
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }

  handlePageEvent(event: PageEvent) {
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;
    this.getProducts();
  }

  onSortChange(event: MatSelectionListChange) {
    const selectedOption = event.options[0];
    if (selectedOption) {
      this.shopParams.sort = selectedOption.value;
      this.shopParams.pageNumber = 1;
      this.getProducts();
    }
  }

  openFiltersDialog() {
    const dialogRef = this.dialogService.open(FiltersDialogComponent, {
      minWidth: '500px',
      data: {
        selectedBrands: this.shopParams.brands,
        selectedTypes: this.shopParams.types,
      },
    });
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.shopParams.brands = result.selectedBrands;
          this.shopParams.types = result.selectedTypes;
          this.shopParams.pageNumber = 1;
          this.getProducts();
        }
      },
    });
  }
}
