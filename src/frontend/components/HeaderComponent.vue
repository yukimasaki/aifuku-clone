<template>
  <header class="sticky top-0 z-30 flex w-full bg-base-100 drop-shadow-1">
    <div class="flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11">
      <!-- Hamburger Toggle Button -->
      <div class="flex items-center gap-2 sm:gap-4 lg:hidden">
        <button
          class="btn btn-square z-50 bg-base-100 p-1 shadow-sm lg:hidden"
          @click.stop="toggleSidebar"
        >
          三
        </button>
      </div>
      <!-- Hamburger Toggle Button -->

      <!-- Middle Area -->
      <div class="hidden sm:block">
      </div>
      <!-- Middle Area -->

      <!-- Right Area -->
      <div class="flex items-center gap-3 2xsm:gap-7">
        <ul class="flex items-center gap-2 2xsm:gap-4">
          <li class="relative"><a>〇</a></li>
          <li class="relative"><a>★</a></li>
        </ul>
      </div>
      <!-- Right Area -->
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