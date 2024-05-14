import Editor, { Monaco,OnMount} from '@monaco-editor/react';
import type {editor} from 'monaco-editor'
import {transform} from '@babel/standalone'
import Preview from './Preview'
import { useRef } from 'react';

function App() {

    const code =`import { useEffect, useState } from "react";

function App() {
    const [num, setNum] = useState(() => {
        const num1 = 1 + 2;
        const num2 = 2 + 3;
        return num1 + num2
    });

    return (
        <div onClick={() => setNum((prevNum) => prevNum + 1)}>{num}</div>
    );
}

export default App;
`;
  const clickhandle = () => {
    console.log(editorRef.current?.getValue());
    const code = editorRef.current?.getValue()
    const res = transform(code!, {
      presets: ['react', 'typescript'],
      filename: 'App3.tsx'
    })
    console.log(res.code);
    handleSenmsg(res.code!)
  }
  const handleSenmsg = (code: string)=>{
    window.frames[0].postMessage({action: 'run', strFn: code},'*')
  }
  const editorRef = useRef<editor.IStandaloneCodeEditor>()
  const handleEditorMount:OnMount = (editor, monaco: Monaco)=>{
    console.log(editor, monaco);
    editorRef.current = editor
  }

    return (
      <div style={{
        display: 'flex',
      }}>
        <Editor height="500px" defaultLanguage="javascript" defaultValue={code} onMount={handleEditorMount} />
        <hr style={{
            margin: '0 20px'
        }}></hr>
        <button onClick={clickhandle}>run</button>
        <hr style={{
            margin: '0 20px'
        }}></hr>
        <Preview />
      </div>
    )
}

export default App;