/*
	filedrag.js - Credits to Craig Buckler (@craigbuckler) of OptimalWorks.net and SitePoint.com
	for the file API demo.
*/
(function() {

	// output information
	function Output(msg) {
		var m = document.getElementById("messages");
		m.innerHTML = msg + m.innerHTML;
	}

	// file drag hover
	function FileDragHover(e) {
		e.stopPropagation();
		e.preventDefault();
		e.target.className = (e.type == "dragover" ? "hover" : "");
	}

	// file selection
	function FileSelectHandler(e) {
		// cancel event and hover styling
		FileDragHover(e);

		// fetch FileList object
		var files = e.target.files || e.dataTransfer.files;

		// process all File objects
		for (var i = 0, f; f = files[i]; i++) {
			ParseFile(f);
		}
	}
	
	function humanFileSize(bytes, si) {
		var thresh = si ? 1000 : 1024;
		if(bytes < thresh) return bytes + ' B';
		var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
		var u = -1;
		do {
			bytes /= thresh;
			++u;
		} while(bytes >= thresh);
		return bytes.toFixed(1)+' '+units[u];
	};

	// output file information
	function ParseFile(file) {
		Output(
			"<p>File information: <strong>" + file.name +
			"</strong> type: <strong>" + file.type +
			"</strong> size: <strong>" + humanFileSize(file.size,1000)
		);

		// check if the file is a pdf and do logic
		if (file.type.indexOf("application/pdf") == 0) {
			var reader = new FileReader();
			reader.onload = function(e) {
				Output(
					"<p><strong>" + file.name + ":</strong><br />"
				);
				try{
					var pdf = new PDFJS.PDFDoc(this.result);
					var total = pdf.numPages;
					//console.log(total);
					
					var pageCollectionCount = 0;
					var div = document.getElementById('viewer');

					for (i = 1; i <= total; i++){
						var page = pdf.getPage(i);
							
						var canvas = document.createElement('canvas');
						canvas.id = 'page' + i;
						canvas.mozOpaque = true;
						
						var scale = 2.0;
						canvas.width = page.width *scale;
						canvas.height = page.height *scale;

						var context = canvas.getContext('2d');
						context.save();
						context.fillStyle = 'rgb(255, 255, 255)';
						context.fillRect(0, 0, canvas.width, canvas.height);
						context.restore();
						div.appendChild(canvas);
						
						if(i==1){
							console.log(canvas);
						}
						
						var textLayer = document.createElement('div');
						textLayer.className = 'textLayer';
						document.body.appendChild(textLayer);
						
						page.startRendering(context, function(){
							if (++self.complete == total){			  
								window.setTimeout(function(){
									var layers = [];
									var nodes = document.querySelectorAll(".textLayer > div");
									for (var j = 0; j < nodes.length; j++){
										layers.push(nodes[j].textContent + "\n");
									}
									console.log("H");
									console.log(layers.join("\n").replace(/\s+/g, " "));
								}, 1000);
							}
						}, textLayer);
					}
				}catch(error){
					console.log("This PDF file appears to be corrupt!");
				}
			}
			reader.onprogress = function(e) {
				console.log(e.loaded + " of " + e.total);
			}
			reader.onerror = function(e) {
				// get window.event if e argument missing (IE fix).
				e = e || window.event;  
				switch(e.target.error.code) {
					case e.target.error.NOT_FOUND_ERR:
						console.log('File was not found on disk!');
						break;
					case e.target.error.NOT_READABLE_ERR:
						console.log('File not readable from disk!');
						break;
					case e.target.error.ABORT_ERR:
						console.log('Read operation was aborted!');
						break; 
					case e.target.error.SECURITY_ERR:
						console.log('File is in a locked state!');
						break;
					case e.target.error.ENCODING_ERR:
						console.log('The file is too long to encode.');
						break;
					default:
						console.log('Read error.');
				}       
			}
			reader.readAsArrayBuffer(file);
		}
	}

	function Init() {
		var fileselect = document.getElementById("fileselect"),
			filedrag = document.getElementById("filedrag"),
			submitbutton = document.getElementById("submitbutton");

		// file select
		fileselect.addEventListener("change", FileSelectHandler, false);

		// file drop
		filedrag.addEventListener("dragover", FileDragHover, false);
		filedrag.addEventListener("dragleave", FileDragHover, false);
		filedrag.addEventListener("drop", FileSelectHandler, false);
		filedrag.style.display = "block";

		// remove submit button
		submitbutton.style.display = "none";
	}

	// call initialization file
	if (window.File && window.FileList && window.FileReader) {
		Init();
	}
})();