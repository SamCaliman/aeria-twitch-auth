<script setup lang="ts">

const CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID
const TWITCH_URL = 'https://id.twitch.tv/oauth2/authorize'

// Redirect User to twitch OAuth page, passing the client id as an paramenter
async function twitchAuth() {
  const params = {
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: 'http://localhost:8080/redirect'
  }
  if(CLIENT_ID){
    window.open(`${TWITCH_URL}`+'?'+`${new URLSearchParams(params).toString()}`, '_self')
  }
}

</script>

<template>
  <section class="
  tw-w-full
  tw-h-[100vh]
  tw-bg-neutral-800
  tw-flex
  "> 
    <div
      class="
        tw-bg-neutral-600
        tw-rounded
        tw-w-3/5
        tw-min-w-[30rem]
        tw-p-6
        tw-flex
        tw-flex-col
        tw-rounded-md
        tw-m-auto
        tw-text-center
        tw-text-white
      "
    >
    Login With twitch
    <aeria-button @click="twitchAuth()">Login</aeria-button>
  </div>
  </section>
  
</template>
