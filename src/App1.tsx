import { useRef } from 'react';
import {transform} from '@babel/standalone'

function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const onClick = () => {
    if(!textareaRef.current) return
    const res = transform(textareaRef.current.value, {
      presets: ['react', 'typescript'],
      filename: 'guang.tsx'
    })
    console.log(res.code);
  }
  const code = `
  import {useState} from 'react'

  function App() {
    const [num, setNum] = useState(()=>{
      const num1 = 1 + 2
      const num2 = 2 + 3
      return num1 + num2
    })

    return (
      <div>
        <button onClick={() => setNum(num + 1)}>{num}</button>
      </div>
    )
  }
  `
  return (
    <div>
      <textarea style={{width: '500px', height: '300px'}} ref={textareaRef} defaultValue={code}></textarea>
      <button onClick={onClick}>编译</button>
    </div>
  )
}
export default App;