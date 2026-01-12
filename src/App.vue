<template>
  <div :class="['app-container', darkMode ? 'dark' : '']">

    <!-- 🔍 SEARCH -->
    <header class="top-bar">
      <input
        v-model="searchText"
        @input="handleSearch"
        type="text"
        placeholder="Cari film..."
        class="search-box"
      />
      <button @click="toggleDarkMode" class="btn-dark">
        {{ darkMode ? '☀' : '🌙' }}
      </button>
    </header>

    <div class="content-wrapper">

      <!-- 🎥 GRID FILM -->
      <ag-grid-vue
        :theme="myTheme"
        style="width: 100%; height: calc(100vh - 80px)"
        :columnDefs="colDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDef"
        :pagination="true"
        :paginationPageSize="10"
        @rowClicked="showDetails"
        @cellClicked="showDetails"
      ></ag-grid-vue>

      <!-- 📝 PANEL DETAIL (KANAN) -->
      <aside v-if="selectedMovie" class="detail-panel">
        <button class="close-btn" @click="selectedMovie=null">✖</button>

        <img :src="selectedMovie.Poster" class="detail-poster" />

        <h2>{{ selectedMovie.Title }}</h2>
        <p>🎬 <strong>{{ selectedMovie.Type }}</strong> ({{ selectedMovie.Year }})</p>

        <!-- ⭐ RATING -->
        <div v-if="selectedMovie.imdbRating !== 'N/A'" class="stars">
          <span v-for="n in 10" :key="n">
            {{ n <= Math.round(selectedMovie.imdbRating) ? '★' : '☆' }}
          </span>
          <span class="rating-text">{{ selectedMovie.imdbRating }} / 10</span>
        </div>

        <p class="plot">{{ selectedMovie.Plot }}</p>
      </aside>

    </div>
  </div>
</template>



<script setup>
import { ref, onMounted } from "vue"
import { AgGridVue } from "ag-grid-vue3"
import debounce from "lodash.debounce"

import {
  themeQuartz,
  iconSetQuartzLight,
} from "ag-grid-community"

// ===================== CUSTOM THEME (QUARTZ BUILDER) ===========================
const myTheme = themeQuartz
  .withPart(iconSetQuartzLight)
  .withParams({
    backgroundColor: "#ffffff",
    browserColorScheme: "light",
    columnBorder: false,
    fontFamily: "Inter, Arial",
    foregroundColor: "rgb(46, 55, 66)",
    headerBackgroundColor: "#F9FAFB",
    headerFontSize: 14,
    headerFontWeight: 600,
    headerTextColor: "#919191",
    oddRowBackgroundColor: "#F9FAFB",
    rowBorder: false,
    sidePanelBorder: false,
    spacing: 8,
    wrapperBorder: false,
    wrapperBorderRadius: 0,
  })

// ====================== STATE =============================
const API_KEY = "a106cbde"
const rowData = ref([])
const selectedMovie = ref(null)
const searchText = ref("avengers")
const currentPage = ref(1)
const darkMode = ref(false)


// ====================== GRID DEFS =========================
const colDefs = ref([
  { field: "Title", headerName: "Judul", flex: 1.5 },
  { 
    field: "imdbRating",
    headerName: "Rating",
    width: 160,
    cellRenderer: params => {
      if (!params.value || params.value === "N/A") return ""
      const ratingNum = Number(params.value)
      const stars = "★".repeat(Math.round(ratingNum))
      return `<span style="color:gold;">${stars}</span> <span style="color:#999;">(${ratingNum})</span>`
    }
  },
  { field: "Year", headerName: "Tahun", width: 120 },
  {
    field: "Plot",
    headerName: "Deskripsi",
    flex: 2,
    cellRenderer: params =>
      params.value ? params.value.slice(0, 120) + "..." : ""
  }
])

const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  flex: 1
}


// =================== FETCH LIST + DETAIL (partial) ===========================
async function loadMovies(page = 1) {
  const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${searchText.value}&page=${page}`)
  const list = await res.json()

  if (!list.Search) return rowData.value = []

  // ambil detail tiap film agar dapat Plot dan Rating
  rowData.value = await Promise.all(
    list.Search.map(async item => {
      const d = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${item.imdbID}&plot=short`)
      const detJson = await d.json()
      return {
        ...item,
        imdbRating: detJson.imdbRating,
        Plot: detJson.Plot !== "N/A" ? detJson.Plot : ""
      }
    })
  )
}


// =================== FETCH DETAIL (full) ===========================
async function showDetails(event) {
  const imdbID = event.data.imdbID
  const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`)
  selectedMovie.value = await res.json()
}


// =================== SEARCH ================================
const handleSearch = debounce(() => {
  currentPage.value = 1
  selectedMovie.value = null
  loadMovies(1)
}, 500)


// =================== PAGINATION ===========================
function handlePagination(params) {
  const newPage = params.api.paginationGetCurrentPage() + 1
  if (newPage !== currentPage.value) {
    currentPage.value = newPage
    loadMovies(newPage)
  }
}


// ================= DARK MODE ==============================
function toggleDarkMode() {
  darkMode.value = !darkMode.value
}

onMounted(() => loadMovies())
</script>



<style>
/* =================== THEME WRAPPER ====================== */
.app-container {
  background: #fafafa;
  color: #222;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.app-container.dark {
  background: #111;
  color: #eee;
}

/* =================== SEARCH BAR ===================== */
.top-bar {
  padding: 15px;
  display: flex;
  gap: 10px;
}
.search-box {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
.btn-dark {
  padding: 10px 16px;
  border-radius: 8px;
  background: #444;
  border: none;
  color: white;
  cursor: pointer;
}

/* =================== LAYOUT ===================== */
.content-wrapper {
  display: flex;
  height: 100%;
}

/* =================== DETAIL PANEL =============== */
.detail-panel {
  width: 30%;
  padding: 20px;
  overflow-y: auto;
  background: rgba(0,0,0,.7);
  color: white;
  backdrop-filter: blur(10px);
}
.close-btn {
  float: right;
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
}
.detail-poster {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 15px;
}
.stars { font-size: 22px; color: gold; }
.rating-text { margin-left: 5px; color: #eee; }
.plot { margin-top: 12px; line-height: 1.5; }
</style>