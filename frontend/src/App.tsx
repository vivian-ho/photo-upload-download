import React, { useState, useEffect, useMemo, useRef } from "react";
import JSZip from "jszip";
import FileSaver from "file-saver";
import "./App.css";

export interface Config {
  downloadUrl: string;
  uploadUrl: string;
  bucket: string;
  fetchUrl: string;
  getContentUrl: string;
}

function App() {
  const config: Config = require("./config.json");
  const INITIAL_COUNT = 4;
  const [file, setFile] = useState<File>();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [downloadDisabled, setDownloadDisabled] = useState(false);
  const [uploadDisabled, setUploadDisabled] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [downloadList, setDownloadList] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [scrollingImages, setScrollingImages] = useState(
    allImages.slice(0, INITIAL_COUNT)
  );
  const [offset, setOffset] = useState(INITIAL_COUNT);
  const [imageInfo, setImageInfo] = useState({
    desc: "",
    title: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const cache = useRef({});

  useMemo(() => {
    if (!allImages.length) {
      // get image file names
      setLoading(true);
      fetch(`${config.fetchUrl}${config.bucket}`)
        .then((result) => result.json())
        .then((keys) => {
          setLoading(false);
          console.log("all available image keys", keys);
          setAllImages(keys);
          setScrollingImages(keys?.slice(0, INITIAL_COUNT));
          console.log("scrollingImages", scrollingImages);
          // get images
        })
        .catch((error) => {
          console.log("error", error);
          setUploadStatus(error);
          setLoading(false);
        });
    }
  }, [allImages]);

  useEffect(() => {
    console.log("file", file);
    setUploadDisabled(!(file !== undefined && desc !== "" && title !== ""));
  }, [file, desc, title]);

  useEffect(() => {
    setDownloadDisabled(downloadList.length === 0);
  }, [downloadList]);

  const onFileChange = (e: React.FormEvent<EventTarget>) => {
    //let target = e.target;
    const target = e.target as HTMLInputElement;

    setFile(target?.files?.[0]);
  };

  const onUpload = () => {
    if (!title) {
      setUploadStatus("Please enter a title");
      return;
    }
    if (!desc) {
      setUploadStatus("Please enter a description");
      return;
    }
    if (!file) {
      setUploadStatus("Please select a file");
      return;
    }
    const url = `${config.uploadUrl}?fileName=${file.name}&title=${title}&desc=${desc}`;
    console.log("url", url, file);
    // get pre-signed url to upload a file
    setLoading(true);
    fetch(url)
      .then((result) => result.json())
      .then((resultForUpload) => {
        setLoading(false);
        const requestOptions: RequestInit = {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        };

        // upload file directly to aws s3 bucket via pre-signed url
        setLoading(true);
        fetch(resultForUpload.uploadURL, requestOptions)
          .then((postResponse) => {
            console.log("onUpload", resultForUpload.uploadURL, postResponse);
            setLoading(false);
            if (postResponse.status === 200) {
              setUploadStatus(`${file.name} uploaded`);
              setAllImages([]); // clear image list to trigger re-fetch from s3
            } else {
              setUploadStatus(`${file.name} failed to upload`);
            }
          })
          .catch((error) => {
            setUploadStatus(error.message);
            setLoading(false);
          });
      });
  };

  const onDownload = async () => {
    const zip = new JSZip();
    let count = 0;
    let zipFilename =
      Date.now().toString(36) + Math.random().toString(36).substring(2);
    zipFilename += "happy-path.zip";

    downloadList?.forEach(
      (image: { fileName: string; body: { type: string; data: Buffer } }) => {
        // convert from buffer to blob
        const content = new Blob([
          new Uint8Array(image.body.data, 0, image.body.data.length),
        ]);
        console.log("onDownload", image);
        zip.file(image.fileName, content, { binary: true });
        count++;

        if (count === downloadList.length) {
          zip.generateAsync({ type: "blob" }).then((zipContent) => {
            FileSaver.saveAs(zipContent, zipFilename);
            console.log("zip", zipFilename);
          });
        }
      }
    );
  };

  const onCheck = (e: React.FormEvent<EventTarget>, image: string) => {
    const target = e.target as HTMLInputElement;

    if (target.checked) {
      // get image metadata, like desc + title
      const downloadRequestUrl = `${config.getContentUrl}${config.bucket}&key=${image}`;
      console.log("cache", cache);
      if (cache?.current?.[downloadRequestUrl]) {
        const content = cache?.current?.[downloadRequestUrl] as any;
        console.log("content", content);
        setImageInfo({ image, ...content?.Metadata });
        setDownloadList([
          ...downloadList,
          { fileName: image, body: content?.Body },
        ]);
        console.log("added", downloadList);
      } else {
        setLoading(true);
        fetch(`${config.getContentUrl}${config.bucket}&key=${image}`)
          .then((response) => response.json())
          .then((content) => {
            console.log("content", content);
            setLoading(false);
            setImageInfo({ image, ...content.Metadata });
            setDownloadList([
              ...downloadList,
              { fileName: image, body: content.Body },
            ]);
            console.log("added", downloadList);
            cache.current[downloadRequestUrl] = content;
          });
      }
    } else {
      setDownloadList(
        downloadList?.filter(
          (item: {
            fileName: string;
            body: { type: string; body: { type: string; data: Buffer } };
          }) => item.fileName !== image
        )
      );
      setImageInfo({ title: "", desc: "", image: "" });
      console.log(
        "remained",
        downloadList?.filter(
          (item: {
            fileName: string;
            body: { type: string; body: { type: string; data: Buffer } };
          }) => item.fileName !== image
        )
      );
    }
  };

  useEffect(() => {
    const onScroll = () => {
      setOffset(offset + 2);
    };
    // clean up code
    window.removeEventListener("scroll", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  useEffect(() => {
    const more = allImages.slice(0, offset);
    setScrollingImages([...more]);
  }, [offset]);

  return (
    <div className="app">
      <header>File upload/download</header>
      {loading && (
        <div className="loader">
          {Array.from(Array(5)).map((dot) => {
            return <div className="dot" key={dot}></div>;
          })}
        </div>
      )}
      <div className="frame">
        <div className="center">
          <div className="title">
            <h1>Click on the image below or drop file to upload</h1>
          </div>

          <div className="dropzone" tabIndex={0} role="button">
            <img
              src="http://100dayscss.com/codepen/upload.svg"
              className="upload-icon"
              aria-hidden="true"
            />
            <input
              type="file"
              className="upload-input"
              onChange={(e) => onFileChange(e)}
              data-testid="image-upload"
            />
          </div>

          <div className="field">
            <div className="label">Title</div>
            <div>
              <input
                type="text"
                onChange={(e) => setTitle(e.target.value)}
                maxLength={256}
              />
            </div>
          </div>

          <div className="field">
            <div className="label">Description</div>
            <div>
              <input
                type="text"
                onChange={(e) => setDesc(e.target.value)}
                maxLength={256}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-upload"
            onClick={onUpload}
            disabled={uploadDisabled}
            aria-label="Upload"
            {...(uploadDisabled && "aria-disabled")}
          >
            Upload file
          </button>
          {uploadStatus}
        </div>
        <div className="downloadCTA">
          <button
            type="button"
            className="btn-download"
            onClick={onDownload}
            disabled={downloadDisabled}
            aria-label="Download"
            {...(downloadDisabled && "aria-disabled")}
          >
            Download file(s)
          </button>
          {/*<div className="download-image">
            <img
              src="http://100dayscss.com/codepen/upload.svg"
              className="download-icon"
            />
        </div>*/}
          <div className="notes">
            (Make sure to select at least 1 image below.)
          </div>
        </div>
      </div>
      <div className="download">
        <div className="images">
          {scrollingImages && (
            <ul>
              {" "}
              {scrollingImages.map((image, index) => {
                return (
                  <li key={image}>
                    <div className="rounded">
                      <img
                        src={`https://${config.bucket}.s3.amazonaws.com/${image}`}
                        alt={image}
                      />
                      {image === imageInfo.image && (
                        <div className="image-info">
                          {imageInfo.desc}
                          <br />
                          {imageInfo.title}
                        </div>
                      )}

                      <label className="checkbox-label" tabIndex={index + 5}>
                        <input
                          type="checkbox"
                          onChange={(e) => onCheck(e, image)}
                          data-testid="check"
                        />
                        <span className="checkbox-span"></span>
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
