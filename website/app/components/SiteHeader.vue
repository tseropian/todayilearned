<template>
  <header id="site-header">
    <div class="title-content">
      <NuxtLink to="/" class="site-title">
        <h1>Today <span class="ink-blue">I Learned</span></h1>
      </NuxtLink>
      <h2>A nerdy list of the things I'm (not) learning on Wikipedia</h2>
    </div>

    <nav class="header-menu">
      <NuxtLink to="/visualisations">Visualisations</NuxtLink>
      <a
        href="mailto:hello@todayilearned.cc"
        target="_blank"
        rel="noopener noreferrer"
      >
        Contact
      </a>
      <a
        href="https://github.com/tseropian/todayilearned"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
    </nav>
  </header>
</template>

<script setup>
// Shared riso header bar used on every page via the default layout.
</script>

<style scoped>
#site-header {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px 24px;
  text-align: left;
  padding: 10px 24px 16px;
  margin-bottom: 2em;
  border-bottom: 3px solid var(--blue);
}

.site-title {
  text-decoration: none;
  color: inherit;
}

#site-header h1 {
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
}

.ink-blue {
  color: var(--blue);
}

.title-content {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 0;
}

#site-header h2 {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  color: var(--coral);
}

.header-menu {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-left: auto;
  font-size: 0.95rem;
}

.header-menu a {
  color: var(--overprint);
  font-weight: 500;
  text-decoration: none;
}

.header-menu a:hover {
  color: var(--blue);
}

@media (max-width: 768px) {
  #site-header {
    padding: 10px 16px 14px;
  }

  #site-header h1 {
    font-size: 1.5rem;
  }
}
</style>
