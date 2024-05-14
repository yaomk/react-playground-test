import type { PluginObj } from '@babel/core'
import { transform } from '@babel/standalone'

function App() {

  const code1 = `
  function add(a, b) {
      return a + b;
  }
  export { add };
  `;

  const url = URL.createObjectURL(new Blob([code1], { type: 'application/javascript' }));

  const transformImportSourcePlugin: PluginObj = {
    visitor: {
      ImportDeclaration(path) {
        path.node.source.value = url;
      }
    },
  }


  const code = `
  import { add } from './add.ts';
  console.log(add(2, 3));
  `

  function onClick() {
    const res = transform(code, {
      presets: ['react', 'typescript'],
      filename: 'guang.ts',
      plugins: [transformImportSourcePlugin]
    });
    console.log(res.code);
  }

  return (
    <div>
      <textarea style={{width: '500px', height: '300px'}} defaultValue={code}></textarea>
      <button onClick={onClick}>编译</button>
    </div>
  )
}

export default App