morpheus.BlobFromPath = function () {
};
morpheus.BlobFromPath.getFileBlob = function (url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.addEventListener('load', function () {
    cb(xhr.response);
  });
  xhr.send();
};

morpheus.BlobFromPath.blobToFile = function (blob) {
  blob.lastModifiedDate = new Date();
  return blob;
};

morpheus.BlobFromPath.getFileObject = function (filePathOrUrl, cb) {
  morpheus.BlobFromPath.getFileBlob(filePathOrUrl, function (blob) {
    cb(morpheus.BlobFromPath.blobToFile(blob));
  });
};