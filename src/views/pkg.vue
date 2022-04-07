<template>
  <div class="pkg">
    <label>Home: </label><a :href="homepage" target="_blank">{{ name }} {{ version }}</a> <label>License: </label>{{ license }}
  </div>
</template>
<script setup>
  import pkg from '@/../package.json';

  const { name, version, homepage, license } = pkg;
  document.title = name;
</script>
<style scoped>
  .pkg {
    text-align: center;
  }
  label {
    margin-left: 20px;
  }
</style>
