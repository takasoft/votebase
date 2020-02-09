<template>
    <div id="app">
        <div class="container">
            <br/>
            <h1><a class="header-link" href="/">Elections for President</a></h1>
            <router-view :key="$route.fullPath" />
        </div>
    </div>
</template>

<script>export default {
        name: 'app',
        created() {

        },
    }</script>

<style>
    .header-link {
        color: black;
        text-decoration: none; /* no underline */
    }

    .break-word {
        word-wrap: break-word;
    }
</style>
