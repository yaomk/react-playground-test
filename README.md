### palygroundTest

- 原理：在文本编辑区编辑代码，通过 babel 编译成可执行的 js 代码，通过 `window.postMessage`、`MessageChannel` 等手段，与 iframe 进行通信，实现代码预览。
- 安装相关依赖：`npm i @babel/standalone @monaco-editor/react`

- 利用 babel 的 transform 将源代码编译

```typescript
import { useState } from 'react'

function App() {
  const [num, setNum] = useState(() => {
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
```

- 编辑配置

```javascript
const res = transform(stringCode, {
  // 预设
  presets: ['react', 'typescript'],
  // 需要编译的源码文件的文件名
  filename: 'index.tsx',
})
console.log(res.code)
// 输出编译后的代码如下
import { useState } from 'react'
import { useState } from 'react'
function App() {
  const [num, setNum] = useState(() => {
    const num1 = 1 + 2
    const num2 = 2 + 3
    return num1 + num2
  })
  return /*#__PURE__*/ React.createElement(
    'div',
    null,
    /*#__PURE__*/ React.createElement(
      'button',
      {
        onClick: () => setNum(num + 1),
      },
      num
    )
  )
}
```

- 多个文件时，如果代码里有引入文件，则需要将被引入的文件的路径更改为可访问的链接

```typescript
// 文件 add.ts
function add(a: number, b: number) {
  return a + b
}
export { add }
```

```typescript
// 文件 index.ts
import { add } from './add.js'

console.log(add(1, 2))
```

通过 将 index.ts 内容编译为 AST 树得知，import 语句在 body 的 ImportDeclaration 中，AST 树如下：

```javascript
// 省略了无关紧要的
{
  "type": "Program",
  "body": [
    {
      "type": "ImportDeclaration",
      "specifiers": [
        {
          "type": "ImportSpecifier",
        }
      ],
      "source": {
        "type": "Literal",
        "value": "./add.ts",
        "raw": "'./add.ts'"
      }
    },
    {
      "type": "ExpressionStatement",
    }
  ],
  "sourceType": "module"
}
```

针对上边的情况，可以对 babel 的 transform 函数进行如下修改：

```typescript
import type { PluginObj } from '@babel/core'
import { transform } from '@babel/standalone'

const add_ts = `
function add(a: number, b: number) {
  return a + b
}
export { add }
`
const index_ts = `
import { add } from './add.js'

console.log(add(1, 2))
`
// 将 add.js 文件转换为可访问的js文件
const url = URL.createObjectURL(
  new Blob([add_ts], { type: 'application/javascript' })
)
const transformImportSourcePlugin: PluginObj = {
  visitor: {
    ImportDeclaration(path) {
      // 修改引入文件的路径
      path.node.source.value = url
    },
  },
}
const res = transform(index_ts, {
  presets: ['react', 'typescript'],
  filename: 'index.ts',
  plugins: [transformImportSourcePlugin],
})
console.log(res.code)
// 编译后结果如下
import { add } from 'blob:http://localhost:5173/a10b7255-1014-4225-9df8-a5e4f8880bcf'
console.log(add(2, 3))

// 在 html 文件，通过 script 标签 type = module 使用
const script = document.createElement('script')
script.type = 'module'
script.textContent = res.code
document.body.append(script)
/*
<script type='module'>
import { add } from "blob:http://localhost:5173/a10b7255-1014-4225-9df8-a5e4f8880bcf";
console.log(add(2, 3));
</script>
*/
```

- 如果引入了第三方库，第三方库处理
  将 script 标签的 type 设置为 '**importmap**'，并指定 esm 模块链接，即可在 script 中使用 `import react from 'react'`

```html
<script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18.2.0"
    }
  }
</script>
<script type="module">
  import react from 'react'
  console.log(react)
</script>
```

- 通过 iframe 标签展示编译后的代码

  - 在 html 文件中使用 react

  ```html
  <div id="root"></div>
  <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.2.0",
        "react-dom/client": "https://esm.sh/react-dom@18.2.0"
      }
    }
  </script>
  <script type="module">
    import react from 'react'
    import ReactDOM from 'react-dom/client'

    window._react = react
    window._ReactDOM = ReactDOM

    const root = document.getElementById('root')
    ReactDOM.createRoot(root).render(
      react.createElement(
        'div',
        { style: { color: 'red' } },
        'createElement test'
      )
    )
  </script>
  ```
  - 与iframe 标签通信，重新渲染编译后的代码
    - 父级 html 文件，通过 `window.postMessage` 方法，`iframeEl.contentWindow.postMessage(data, '*')` 进行事件发送。将编译过后的代码（字符串）发送出去。
    - iframe 实际指向的 html 文件，通过监听 `message` 事件，`window.addEventListener('message', handleGetMaessage, false)` 获取发送的事件，并执行对应的操作。