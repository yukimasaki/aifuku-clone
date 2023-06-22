<template>
  <header class="sticky top-0 z-30 flex w-full bg-base-100 drop-shadow">
    <div class="flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11">
      <!-- Hamburger Toggle Button -->
      <div class="flex items-center gap-2 sm:gap-4 lg:hidden">
        <button
          class="btn btn-square z-50 bg-base-100 p-1 shadow-sm lg:hidden"
          @click.stop="toggleSidebar"
        >
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path :d="mdiMenuPath"></path>
          </svg>
        </button>
      </div>
      <!-- Hamburger Toggle Button -->

      <!-- Middle Area -->
      <div class="hidden sm:block">
      </div>
      <!-- Middle Area -->

      <!-- Right Area -->
      <div class="flex items-center gap-3 2xsm:gap-7">
        <!-- Icon Sample -->
        <ul class="flex items-center gap-2 2xsm:gap-4">
          <li class="relative"><a>〇</a></li>
          <li class="relative"><a>★</a></li>
        </ul>
        <!-- Icon Sample -->

        <!-- User Area -->
        <div class="relative">
          <a class="flex items-center gap-4" href="#" @click.prevent="dropdownOpen = !dropdownOpen">
            <span class="hidden text-right lg:block">
              <span class="block text-sm font-medium text-black">Ms. Anko</span>
              <span class="block text-xs font-medium">Chief Engineer</span>
            </span>

            <div class="avatar">
              <div class="w-12 rounded-full">
                <img src="../assets/images/user-icon.png" alt="User Icon">
              </div>
            </div>

            <svg :class="dropdownOpen && 'rotate-180'" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path :d="mdiChevronDownPath"></path>
            </svg>
          </a>

          <!-- Dropdown Start -->
          <div v-if="dropdownOpen" class="absolute right-0 mt-4 flex w-64 flex-col rounded-sm border border-stroke bg-base-100 shadow-default">
            <ul class="flex flex-col gap-5 border-b border-stroke px-6 py-7">
              <li>
                <a href="profile.html" class="flex items-center gap-3 text-sm font-medium duration-300 ease-in-out hover:text-primary">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
                    <path :d="mdiAccountOutlinePath"></path>
                  </svg>
                  My Profile
                </a>
              </li>
              <li>
                <a href="settings.html" class="flex items-center gap-3 text-sm font-medium duration-300 ease-in-out hover:text-primary">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
                    <path :d="mdiCogOutlinePath"></path>
                  </svg>
                  Account Settings
                </a>
              </li>
            </ul>
            <button class="flex items-center gap-3 py-4 px-6 text-sm font-medium duration-300 ease-in-out hover:text-primary">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" style="transform: scaleX(-1)">
                <path :d="mdiLogoutPath"></path>
              </svg>
              Log Out
            </button>
          </div>
          <!-- Dropdown End -->
        </div>
        <!-- User Area -->
      </div>
      <!-- Right Area -->
    </div>
  </header>
</template>

<script setup>
import { mdiMenu, mdiChevronDown, mdiAccountOutline, mdiCogOutline, mdiLogout } from '@mdi/js'

const visibleSidebar = useState('visibleSidebar', () => false)

// todo: composable化したい
const toggleSidebar = () => {
  visibleSidebar.value = !visibleSidebar.value
}

const dropdownOpen = ref(false)

const mdiMenuPath = ref(mdiMenu)
const mdiChevronDownPath = ref(mdiChevronDown)
const mdiAccountOutlinePath = ref(mdiAccountOutline)
const mdiCogOutlinePath = ref(mdiCogOutline)
const mdiLogoutPath = ref(mdiLogout)
</script>
