<template>
  <header class="sticky top-0 z-999 flex w-full bg-base-200 drop-shadow-1">
    <div class="flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11">
      <!-- Hamburger Toggle Button -->
      <div class="flex items-center gap-2 sm:gap-4 lg:hidden">
        <button
          class="btn btn-square z-99999 bg-base-100 p-1 shadow-sm lg:hidden"
          @click.stop="toggleSidebar"
        >
          三
        </button>
      </div>
      <!-- Hamburger Toggle Button -->
    </div>
  </header>
</template>

<script>
export default {
  setup () {  
    const visibleSidebar = useState('visibleSidebar', () => false)

    const toggleSidebar = () => {
      visibleSidebar.value = !visibleSidebar.value
      console.log(visibleSidebar.value)
    }

    return { 
      visibleSidebar, toggleSidebar
    }
  }
}
</script>