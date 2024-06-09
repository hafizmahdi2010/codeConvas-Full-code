import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import JSZip from 'jszip';
import "./App.css";

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="style.css">
  <title>Document</title>
</head>
<body>
  <h1>Welcome to <b>CodeCanvas</b> Editor</h1>
  <p>This editor is developed by <b>Mo. Mahdi Farooqui</b></p>
  <p>You can also download the code as a zip file.</p>
  <p>If You Want To Make These Type Of Projects Subscribe To My YouTube Channel <a href="https://www.youtube.com/channel/UCY2ZhM00ed3bW-nTJcyMYBg" target="_blank">CodeWithMahdi</a></p>
  <script src="script.js"></script>
</body>
</html>`;

const DEFAULT_CSS = `*{
  margin: 0;
  padding: 0;
}
body{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}`;

const DEFAULT_JS = `console.log("Your script.js File Is Running...")`;

const App = () => {
  const [language, setLanguage] = useState("html");
  const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML);
  const [cssContent, setCssContent] = useState(DEFAULT_CSS);
  const [jsContent, setJsContent] = useState(DEFAULT_JS);
  const iframeRef = useRef(null);
  const previewWindowRef = useRef(null);

  const isContentModified = () => {
    return htmlContent !== DEFAULT_HTML || cssContent !== DEFAULT_CSS || jsContent !== DEFAULT_JS;
  };

  const updateIframeContent = () => {
    const document = iframeRef.current.contentDocument;
    document.open();
    document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${cssContent}</style>
      </head>
      <body>
        ${htmlContent}
        <script>
          (function() {
            ${jsContent}
          })();
        </script>
      </body>
      </html>
    `);
    document.close();
  };

  useEffect(() => {
    updateIframeContent();
  }, [htmlContent, cssContent, jsContent]);

  const handleEditorChange = (value, lang) => {
    switch (lang) {
      case 'html':
        setHtmlContent(value);
        break;
      case 'css':
        setCssContent(value);
        break;
      case 'javascript':
        setJsContent(value);
        break;
      default:
        break;
    }

    updateIframeContent();
    if (previewWindowRef.current) {
      updatePreviewContent();
    }
  };

  const handleDownload = async () => {
    const zipFile = new JSZip();
    zipFile.file('index.html', htmlContent);
    zipFile.file('style.css', cssContent);
    zipFile.file('script.js', jsContent);

    const blob = await zipFile.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'CodeCanvasProject.zip';
    link.click();
  };

  const openPreviewInNewTab = () => {
    const previewHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${cssContent}</style>
      </head>
      <body>
        ${htmlContent}
        <script>
          (function() {
            ${jsContent}
          })();
        </script>
      </body>
      </html>
    `;
    previewWindowRef.current = window.open();
    previewWindowRef.current.document.write(previewHtml);
    previewWindowRef.current.document.close();
    previewWindowRef.current.addEventListener('beforeunload', () => {
      previewWindowRef.current = null;
    });
  };

  const updatePreviewContent = () => {
    if (previewWindowRef.current) {
      const previewHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${cssContent}</style>
        </head>
        <body>
          ${htmlContent}
          <script>
            (function() {
              ${jsContent}
            })();
          </script>
        </body>
        </html>
      `;
      previewWindowRef.current.document.open();
      previewWindowRef.current.document.write(previewHtml);
      previewWindowRef.current.document.close();
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isContentModified()) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        event.returnValue = message; // Standard for most browsers
        return message; // Required for some browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [htmlContent, cssContent, jsContent]);

  const [mode, setMode] = useState("dark");
  const toggleDarkMode = () => {
    let modeIcon = document.querySelector(".modeIcon");
    let toggleModeBtnDot = document.querySelector(".toggleModeBtn > .dot");
    if(mode === "dark"){
      setMode("light");
      document.body.classList.add("lightTheme");
      modeIcon.classList.replace("ri-sun-fill","ri-moon-fill");
      toggleModeBtnDot.classList.add("active");
    } else {
      setMode("dark");
      document.body.classList.remove("lightTheme");
      modeIcon.classList.replace("ri-moon-fill","ri-sun-fill");
      toggleModeBtnDot.classList.remove("active");
    }
  };

  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const toggleExpandCode = () => {
    let codeContainer = document.querySelector(".editorleft");
    if(isCodeExpanded === false){
     codeContainer.classList.add("fullScreenCode");
     setIsCodeExpanded(true);
    } else {
     codeContainer.classList.remove("fullScreenCode");
     setIsCodeExpanded(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        alert('hello1');
      }
    };
  
    window.addEventListener('keydown', handleKeyDown, true);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  return (
    <div className='conMain flex flex-col items-center justify-center h-screen bg-zinc-800 text-white'>
      <div className="editorcon w-[95vw] h-[95vh] self-center bg-zinc-900">
        <div className="tabs flex items-center gap-1 border-b-2 border-blue-500 pb-3 px-3">
          <img className='logo w-[170px] mt-3 mr-3' src={require("./images/logs/LogoBig.png")} alt="" />
          <div
            className={language === "html" ? "active tab flex items-center justify-center min-w-[150px] bg-zinc-800 cursor-pointer mt-3 h-[35px]" : "tab flex items-center justify-center min-w-[150px] bg-zinc-700 cursor-pointer mt-3 h-[35px]"}
            onClick={() => setLanguage("html")}
          >
            <img src={require("./images/html.png")} alt="" />
            index.html
          </div>
          <div
            className={language === "css" ? "active tab flex items-center justify-center min-w-[150px] bg-zinc-800 cursor-pointer mt-3 h-[35px]" : "tab flex items-center justify-center min-w-[150px] bg-zinc-700 cursor-pointer mt-3 h-[35px]"}
            onClick={() => setLanguage("css")}
          >
            <img src={require("./images/css.png")} alt="" />
            style.css
          </div>
          <div
            className={language === "javascript" ? "active tab flex items-center justify-center min-w-[150px] bg-zinc-800 cursor-pointer mt-3 h-[35px]" : "tab flex items-center justify-center min-w-[150px] bg-zinc-700 cursor-pointer mt-3 h-[35px]"}
            onClick={() => setLanguage("javascript")}
          >
            <img src={require("./images/js.png")} alt="" />
            script.js
          </div>

          <div className='expandCodeBtn mt-3 ml-2 cursor-pointer flex items-center gap-1' onClick={toggleExpandCode}>Expand Code <i className="ri-expand-width-fill text-[19px] mt-1"></i></div>

          <div className='flex items-center gap-1 ml-auto mt-3'>
            <div className="toggleModeBtn" onClick={toggleDarkMode}>
              <span className='dot'><i className="ri-sun-fill modeIcon"></i></span>
            </div>
            <button onClick={openPreviewInNewTab} className="preview-button ml-auto bg-blue-500 text-white px-3 py-2 rounded">Open Preview</button>
            <button onClick={handleDownload} className="download-button bg-blue-500 text-white px-3 py-2 rounded">Download</button>
          </div>
        </div>
        <div className="editor flex items-center justify-between w-full h-[87vh]">
          <div className="editorleft h-full bg-zinc-700 w-[49.5%]">
            <Editor
              height="100%"
              language={language}
              value={
                language === "html"
                  ? htmlContent
                  : language === "css"
                    ? cssContent
                    : jsContent
              }
              onChange={(value) => handleEditorChange(value, language)}
              theme={mode === "dark" ? "vs-dark" : "vs-light"}
              options={{
                quickSuggestions: true,
                wordBasedSuggestions: false,
                suggestOnTriggerCharacters: true,
                emmet: true,
              }}
            />
          </div>
          <iframe
            className="output h-full w-[49.5%] bg-[#fff]"
            ref={iframeRef}
            style={{visibility: isCodeExpanded ? "hidden" : "visible"}}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default App;
