import './lightbox.scss';
export default function smartLightbox(options = {}) {

	let defaults = {
		containerSelector: "article",
		imageSelector: "img",
		lineSelector: "p",
		galery: true,
		bigImageAttr: "src",
		background: "rgba(0,0,0,0.8)",
		borderRadius: 0,
		gap: 0,
		blur: 0,
	};

	const settings = Object.assign({}, defaults, options);
	const badImage = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMC8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvVFIvMjAwMS9SRUMtU1ZHLTIwMDEwOTA0L0RURC9zdmcxMC5kdGQnPjxzdmcgaGVpZ2h0PSIzMiIgc3R5bGU9Im92ZXJmbG93OnZpc2libGU7ZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzMiAzMiIgdmlld0JveD0iMCAwIDMyIDMyIiB3aWR0aD0iMzIiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxnIGlkPSJFcnJvcl8xXyI+PGcgaWQ9IkVycm9yIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiBpZD0iQkciIHI9IjE2IiBzdHlsZT0iZmlsbDojRDcyODI4OyIvPjxwYXRoIGQ9Ik0xNC41LDI1aDN2LTNoLTNWMjV6IE0xNC41LDZ2MTNoM1Y2SDE0LjV6IiBpZD0iRXhjbGFtYXRvcnlfeDVGX1NpZ24iIHN0eWxlPSJmaWxsOiNFNkU2RTY7Ii8+PC9nPjwvZz48L2c+PC9zdmc+";

	let root = document.documentElement;
	root.style.setProperty("--lightbox-background", settings.background);
	root.style.setProperty("--lightbox-border-radius", settings.borderRadius);
	root.style.setProperty("--lightbox-gap", settings.gap);
	root.style.setProperty("--lightbox-blur", settings.blur);

	let containers = document.querySelectorAll(settings.containerSelector);
	let group = 0;
	for (let container of containers) {
		let lines = container.querySelectorAll(settings.lineSelector + ":not(.lightbox-line)");
		for (let line of lines) {
			let images = line.querySelectorAll(settings.imageSelector + ":not(.lightbox-image)");
			if (images.length == 0) {
				group++;
				continue;
			} else {
				if (settings.galery) line.classList.add("lightbox-line");
				for (let image of images) {
					image.classList.add("lightbox-image");
					image.dataset.group = group;
					image.addEventListener("click", openLightBox, false);

					image.onload = function(event) {
						event.target.style.maxWidth = `min(${image.naturalWidth}px, 100%)`;
						if (settings.galery) {
							resizeLine(event.target.parentNode.parentNode);
						}
					}

					if (settings.galery) {
						wrapImage(image);
					}
				}
			}
		}
		group++;
	}

	function resize() {
		let lines = document.querySelectorAll(".lightbox-line");
		for (let line of lines) {
			resizeLine(line);
		}
	}

	function resizeLine(line) {
		line.style.height = null;
		let images = line.querySelectorAll(".lightbox-image");
		if (images.length == 0) return;
		let minHeight = images[0].clientHeight;
		for (let image of images) {
			minHeight = image.clientHeight < minHeight ? image.clientHeight : minHeight;
		}
		line.style.height = minHeight + "px";
	}

	function wrapImage(image) {
		if (image.parentNode.tagName == "A") {
			image.parentNode.classList.add("lightbox-image-crop");
			image.parentNode.addEventListener("click", function(event){
				event.preventDefault();
			});
		} else {
			let wrapper = document.createElement("div");
			wrapper.classList.add("lightbox-image-crop");
			image.parentNode.insertBefore(wrapper, image);
			wrapper.appendChild(image);
		}
	}

	function openLightBox(event) {
		let currentImage = event.currentTarget;
		let group = document.querySelectorAll(".lightbox-image[data-group='" + currentImage.dataset.group + "']");

		let lightBox = document.createElement("div");
		lightBox.classList.add("lightbox");

		let content = document.createElement("div");
		content.classList.add("lightbox-content");
		let current = null;

		if (group.length > 1) {

			lightBox.classList.add("group");

			for (let image of group) {
				let img = document.createElement("img");
				let src = getSrc(image);
				img.setAttribute("src", src);

				img.onload = function() {
					if (this.src != badImage) {
						this.style.maxHeight = `min(${img.naturalHeight}px, 90vh)`;
						this.style.maxWidth = `min(${img.naturalWidth}px, 90vw)`;
					}
				}

				img.onerror = function () {
					this.style.width = "200px";
						this.style.height = "200px";
					this.src = badImage;
				}
				
				img.addEventListener("click", function(event) {
					event.preventDefault();
					event.stopPropagation();
					selectImage(event.currentTarget);
				});

				if (src == getSrc(currentImage)) {
					current = img;
				}

				content.appendChild(img);
			}
		} else {
			lightBox.classList.add("panorama");
			let img = document.createElement("img");
			img.setAttribute("src", getSrc(group[0]));
			content.appendChild(img);
			if (img.naturalWidth / img.naturalHeight > 1) {
				lightBox.classList.add("horizontal");
				img.style.maxHeight = `min(${img.naturalHeight}px, 90vh)`;
			} else {
				lightBox.classList.add("vertical");
				img.style.maxWidth = `min(${img.naturalWidth}px, 90vw)`;
			}
			current = img;
		}

		selectImage(current);

		lightBox.appendChild(content);
		lightBox.addEventListener("click", closeLightBox);

		if (group.length > 1) {
			var xDown = null;
			lightBox.addEventListener('touchstart', handleTouchStart, false);
			lightBox.addEventListener('touchmove', handleTouchMove, false);
		}

		document.body.classList.add("open-lightbox");
		document.body.appendChild(lightBox);
		document.addEventListener("keydown", hotkeys);



		if ('onwheel' in document) {
			lightBox.addEventListener("wheel", onWheel);
		} else if ('onmousewheel' in document) {
			lightBox.addEventListener("mousewheel", onWheel);
		} else {
			lightBox.addEventListener("MozMousePixelScroll", onWheel);
		}
	}

	function closeLightBox() {
		document.removeEventListener("keyup", hotkeys);
		document.querySelector(".lightbox").remove();
		document.body.classList.remove("open-lightbox");
	}

	function hotkeys(event) {
		if (event.key == "Escape") {
			closeLightBox();
		}

		let lightbox = document.querySelector(".lightbox");
		if (lightbox == null) return;
		if (lightbox.classList.contains("panorama")) {
			let delta = 40;
			if (lightbox.classList.contains("horizontal")) {
				if (event.key == "ArrowLeft") {
					lightbox.scrollLeft -= delta;
				}
				if (event.key == "ArrowRight") {
					lightbox.scrollLeft += delta;
				}
			} else {
				if (event.key == "ArrowUp") {
					lightbox.scrollTop -= delta;
				}
				if (event.key == "ArrowDown") {
					lightbox.scrollTop += delta;
				}
			}
		} else {

			if (event.key == "ArrowLeft") {
				prevImage();
			}

			if (event.key == "ArrowRight") {
				nextImage();
			}
		}
	}

	function onWheel(event) {
		event = event || window.event;
		event.preventDefault ? event.preventDefault() : (event.returnValue = false);
		let delta = event.deltaY || event.detail || event.wheelDelta;
		let lightbox = document.querySelector(".lightbox");
		if (lightbox == null) return;
		if (lightbox.classList.contains("panorama")) {
			if (lightbox.classList.contains("horizontal")) {
				lightbox.scrollLeft += delta;
			} else {
				lightbox.scrollTop += delta;
			}
		} else {
			if (delta > 0) {
				nextImage();
			} else {
				prevImage();
			}
		}

	}

	function prevImage() {
		let lightbox = document.querySelector(".lightbox");
		if (!lightbox) return;
		let current = document.querySelector(".lightbox-content img.current");
		selectImage(current.previousSibling);
	}

	function nextImage() {
		let lightbox = document.querySelector(".lightbox");
		if (!lightbox) return;
		let current = document.querySelector(".lightbox-content img.current");
		selectImage(current.nextSibling);
	}

	function selectImage(image) {
		if (image != undefined) {
			for (let i of image.parentNode.querySelectorAll("img")) {
				i.classList = "";
			}
			image.classList.add("current");
			if (image.nextSibling) {
				image.nextSibling.classList.add("next");
			}
			if (image.previousSibling) {
				image.previousSibling.classList.add("prev");
			}
		}
	}

	if (settings.galery) {
		window.addEventListener("resize", resize);
		resize();
	}

	function handleTouchStart(event) {
		const firstTouch = event.touches[0];
		xDown = firstTouch.clientX;
	};

	function handleTouchMove(event) {
		if (!xDown) {
			return;
		}

		const xUp = event.touches[0].clientX;

		if (xDown - xUp > 0) {
			nextImage();
		} else {
			prevImage();
		}

		xDown = null;
	};

	function getSrc(image) {
		let src = image.getAttribute("src");
		if (settings.bigImageAttr == "href") {
			if (image.parentNode.hasAttribute("href")) {
				src = image.parentNode.getAttribute("href");
			}
		} else {
			if (image.hasAttribute(settings.bigImageAttr)) {
				src = image.getAttribute(settings.bigImageAttr);
			}
		}
		return src;
	}
};