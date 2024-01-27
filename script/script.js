//Get the sliders and the values so that we can update the value when the slider changes
const qualitySlider = document.getElementById("quality");
const qualityValueSpan = document.getElementById("qualityValue");
const maxSizeSlider = document.getElementById("maxSize");
const maxSizeValueSpan = document.getElementById("maxSizeValue");

window.addEventListener("load", loadSliderValues);

qualitySlider.addEventListener("input", function () {
  qualityValueSpan.textContent = this.value;
  saveSliderValues();
});

maxSizeSlider.addEventListener("input", function () {
  maxSizeValueSpan.textContent = this.value;
  saveSliderValues();
});

// Function to save slider values to local storage
function saveSliderValues() {
  localStorage.setItem("quality", qualitySlider.value);
  localStorage.setItem("maxSize", maxSizeSlider.value);
}

// Function to load slider values from local storage
function loadSliderValues() {
  const savedQuality = localStorage.getItem("quality");
  const savedMaxSize = localStorage.getItem("maxSize");

  if (savedQuality) {
    qualitySlider.value = savedQuality;
    qualityValueSpan.textContent = savedQuality;
  }

  if (savedMaxSize) {
    maxSizeSlider.value = savedMaxSize;
    maxSizeValueSpan.textContent = savedMaxSize;
  }
}

//////////////

// Handler for the file upload drop zone
const fileInput = document.getElementById("fileInput");

document.getElementById("fileInput").addEventListener("change", function () {
  const fileList = this.files;
  updateDropMessage(fileList);
});

function selectFiles() {
  document.getElementById("fileInput").click();
}

const fileDropZone = document.getElementById("fileDropZone");
const dropMessage = document.getElementById("dropMessage");

// Prevent default behavior for drag and drop events
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  fileDropZone.addEventListener(eventName, preventDefaults, false);
});

// Highlight the drop zone when a file is dragged over it
["dragenter", "dragover"].forEach((eventName) => {
  fileDropZone.addEventListener(eventName, highlightDropZone, false);
});

// Unhighlight the drop zone when a file is dragged away from it
["dragleave", "drop"].forEach((eventName) => {
  fileDropZone.addEventListener(eventName, unhighlightDropZone, false);
});

// Handle dropping files onto the drop zone
fileDropZone.addEventListener("drop", handleDrop, false);

// Function to prevent default behavior for drag and drop events
function preventDefaults(event) {
  event.preventDefault();
  event.stopPropagation();
}

// Function to highlight the drop zone when a file is dragged over it
function highlightDropZone(event) {
  fileDropZone.classList.add("highlight");
}

// Function to unhighlight the drop zone when a file is dragged away from it
function unhighlightDropZone(event) {
  fileDropZone.classList.remove("highlight");
}

// Function to handle dropping files onto the drop zone
function handleDrop(event) {
  const fileList = event.dataTransfer.files;
  document.getElementById("fileInput").files = fileList;
  updateDropMessage(fileList);
}

// Function to update the drop message with the selected file names
function updateDropMessage(fileList) {
  dropMessage.textContent =
    fileList.length > 1
      ? `${fileList.length} files selected`
      : fileList[0].name;
}

// Function to send the files to the backend and download the returned file
function resizeImages() {
  const fileInput = document.getElementById("fileInput");
  const files = fileInput.files;
  if (files.length === 0) {
    console.log("No files selected");
    return;
  }

  // Disable the button while we are busy
  const submitButton = document.getElementById("submitButton");
  submitButton.disabled = true;
  const originalText = submitButton.innerText;
  submitButton.innerText = "Resizing images, then download will start...";
  submitButton.classList.add("processing");

  const formData = new FormData();
  formData.append("max_size", maxSize.value);
  formData.append("quality", quality.value);

  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }
  console.log("Max size:", formData.get("max_size"));
  console.log("Quality:", formData.get("quality"));

  const numberOfFiles = formData.getAll("files").length;
  console.log("Number of files:", numberOfFiles);

  fetch("http://localhost:5001/resizeimage", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.blob();
    })
    .then((blob) => {
      // Trigger automatic download of the blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "resized_images.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      location.reload();
    })
    .catch((error) => {
      // Re-enable the button and restore the original text in case of an error
      console.error("Error:", error);
      location.reload();
    });
}
