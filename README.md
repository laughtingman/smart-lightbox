# Smart Lightbox

Lightweight lightbox for photo galleries without dependencies.

## Features

1. Open images in popup full screen viewer.
2. Grouping images in page to nice responsitive photosets.
3. Support hotkeys, mouse wheel and touch events to swith images.
4. Customizable and can be confugured with any DOM structure.

## Install

1. Include js and css files from dist folder
2. Add an images in your pare
2. Place code on the bottom of the page or in the domContentLoaded callback

```html
<article>
	<h1>This is my beautiful cat!</h1>
	<p>His name is Tom</p>
	<p>
		<a href="bigCat.jpg"><img src="cat.jpg" alt="My cat"></a>
	</p>
</article>
<script>
	lightBox({
		containerSelector: "article",
		lineSelector: "p",
		imgSelector: "img",
		bigImageAttr: "href"
	});
</script>
```

See all features options in [DEMO](https://laughtingman.github.io/smart-lightbox/)

