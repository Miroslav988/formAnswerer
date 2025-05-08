<template>
  <div id="app" class="app-container">
    <h1>Заявка на автоматические ответы на Google Форму</h1>
    <FormRequest />
  </div>
</template>

<script>
import FormRequest from "./components/FormRequest.vue";

export default {
  name: "App",
  components: {
    FormRequest,
  },
};
</script>

<style>
html,
#app {
  background: #000;
  color: white;
  min-height: 100vh;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: rgb(103, 58, 183);
  margin-bottom: 20px;
}

.app-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
