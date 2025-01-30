<script lang="ts">
    interface Props {
        alt?: string;
        height?: string;
        width?: string;
    }

    let { alt = 'Loading...', height, width }: Props = $props();
</script>

<div
    style:width
    style:height
    style:aspect-ratio="1/1"
    style:display="flex"
    style:-webkit-mask-size="cover"
    style:color="inherit"
    style:background="currentColor"
    style:mask-image="url('/wallo_animation.webp')"
    style:-webkit-mask-image="url('/wallo_animation.webp')"
    style:mask-repeat="no-repeat"
    style:mask-position="center"
    style:mask-size="contain"
    title={alt}
></div>
