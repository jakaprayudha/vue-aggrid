<template>
  <div class="ag-theme-alpine" style="height: 500px; width: 100%;">
    <AgGridVue
      :columnDefs="columnDefs"
      :rowData="rowData"
      :defaultColDef="defaultColDef"
      :pagination="true"
      :paginationPageSize="10"
    ></AgGridVue>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'

const columnDefs = ref([
  { field: 'product' },
  { field: 'category' },
  { field: 'price' },
  { field: 'stock' }
])

const rowData = ref([
  { product: 'Keyboard', category: 'Electronics', price: 29.99, stock: 120 },
  { product: 'Mouse', category: 'Electronics', price: 19.99, stock: 200 }
])

const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true
}
</script>

<style>
@import "ag-grid-community/styles/ag-grid.css";
@import "ag-grid-community/styles/ag-theme-alpine.css";
</style>