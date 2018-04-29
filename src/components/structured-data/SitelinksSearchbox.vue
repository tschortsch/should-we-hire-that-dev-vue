<template>
  <script type="application/ld+json" v-if="siteUrl">
  {
    "@context": "http://schema.org",
    "@type": "WebSite",
    "url": "{{ siteUrl }}",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "{{ siteUrl }}/{username}",
      "query-input": "required name=username"
    }
  }
  </script>
</template>

<script>
export default {
  name: 'SitelinksSearchbox',
  computed: {
    siteUrl () {
      return process.env.SITE_URL || null
    }
  }
}
</script>
