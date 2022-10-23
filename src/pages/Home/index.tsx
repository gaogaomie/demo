import Guide from '@/components/Guide';
import { trim } from '@/utils/format';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import styles from './index.less';
import MonacoEditor from 'react-monaco-editor';
import { useState, useRef } from 'react';
// 按需引入，需要配合monaco-editor-webpack-plugin 的languages 和 features的配置项加载其他功能
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import  {language}  from 'monaco-editor/esm/vs/basic-languages/sql/sql';
const { keywords } = language

//自定义主题
monaco.editor.defineTheme('myThem', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    //如果想抄vscode摸个主题色，可以使用ctrl+shift+p 输入Developer：Inspect Editor Tokens and Scopes
    'editor.foreground': '#A6E22E',
    'editor.background': '#272822',
    'editor.language': 'typescriptreact',
  },
});

//语言服务  json 可以配置JSON schema，从而拥有校验和自动补全的功能
monaco.languages.registerCompletionItemProvider('sql', {
  triggerCharacters: ['.', ...keywords],
  provideCompletionItems: (model, position) => {
    let suggestions:any = [];

    const { lineNumber, column } = position;

    const textBeforePointer = model.getValueInRange({
      startLineNumber: lineNumber,
      startColumn: 0,
      endLineNumber: lineNumber,
      endColumn: column,
    });

    const tokens = textBeforePointer.trim().split(/\s+/);
    const lastToken = tokens[tokens.length - 1]; // 获取最后一段非空字符串

    if (lastToken.endsWith('.')) {
      const tokenNoDot = lastToken.slice(0, lastToken.length - 1);
      if (Object.keys(_that.hintData).includes(tokenNoDot)) {
        suggestions = [..._that.getTableSuggest(tokenNoDot)];
      }
    } else if (lastToken === '.') {
      suggestions = [];
    } else {
      suggestions = [..._that.getDBSuggest(), ..._that.getSQLSuggest()];
    }

    return {
      suggestions,
    };
  },
});

/*
  monaco.languages.registerCompletionItemProvider('xml', {
    triggerCharacters: ['>'],
    provideCompletionItems: (model, position) => {
      const codePre = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      const tag = codePre.match(/.*<(\w+)>$/)?.[1];

      if (!tag) {
        return;
      }

      const word = model.getWordUntilPosition(position);
      return {
        suggestions: [
          {
            label: `</${tag}>`,
            kind: monaco.languages.CompletionItemKind.EnumMember,
            insertText: `$1</${tag}>`,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn,
            },
          },
        ],
      };
    },
  });
*/

function createDependencyProposals(range) {
  // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
  // here you could do a server side lookup
  return [
    {
      label: '"lodash"',
      kind: monaco.languages.CompletionItemKind.Function,
      documentation: 'The Lodash library exported as Node.js modules.',
      insertText: '"lodash": "*"',
      range: range,
    },
    {
      label: '"express"',
      kind: monaco.languages.CompletionItemKind.Function,
      documentation: 'Fast, unopinionated, minimalist web framework',
      insertText: '"express": "*"',
      range: range,
    },
    {
      label: '"mkdirp"',
      kind: monaco.languages.CompletionItemKind.Function,
      documentation: 'Recursively mkdir, like <code>mkdir -p</code>',
      insertText: '"mkdirp": "*"',
      range: range,
    },
    {
      label: '"my-third-party-library"',
      kind: monaco.languages.CompletionItemKind.Function,
      documentation: 'Describe your library here',
      insertText: '"${1:my-third-party-library}": "${2:1.2.3}"',
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
  ];
}

monaco.languages.registerCompletionItemProvider('json', {
  provideCompletionItems: function (model, position) {
    // find out if we are completing a property in the 'dependencies' object.
    var textUntilPosition = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });
    var match = textUntilPosition.match(
      /"dependencies"\s*:\s*\{\s*("[^"]*"\s*:\s*"[^"]*"\s*,\s*)*([^"]*)?$/,
    );
    if (!match) {
      return { suggestions: [] };
    }
    var word = model.getWordUntilPosition(position);
    var range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };
    return {
      suggestions: createDependencyProposals(range),
    };
  },
});

var jsCode = [
  '"use strict";',
  'function Person(age) {',
  '	if (age) {',
  '		this.age = age;',
  '	}',
  '}',
  'Person.prototype.getAge = function () {',
  '	return this.age;',
  '};',
].join('\n');

const HomePage: React.FC = () => {
  const { name } = useModel('global');
  // const [code, setCode] = useState('');

  const monacoEditorProps = {
    width: 800,
    height: 600,
    acceptSuggestionOnCommitCharacter: true, // 接受关于提交字符的建议
    acceptSuggestionOnEnter: 'on', // 接受输入建议 "on" | "off" | "smart"
    accessibilityPageSize: 10, // 辅助功能页面大小 Number 说明：控制编辑器中可由屏幕阅读器读出的行数。警告：这对大于默认值的数字具有性能含义。
    accessibilitySupport: 'on', // 辅助功能支持 控制编辑器是否应在为屏幕阅读器优化的模式下运行。
    autoClosingBrackets: 'always', // 是否自动添加结束括号(包括中括号) "always" | "languageDefined" | "beforeWhitespace" | "never"
    autoClosingDelete: 'always', // 是否自动删除结束括号(包括中括号) "always" | "never" | "auto"
    autoClosingOvertype: 'always', // 是否关闭改写 即使用insert模式时是覆盖后面的文字还是不覆盖后面的文字 "always" | "never" | "auto"
    autoClosingQuotes: 'always', // 是否自动添加结束的单引号 双引号 "always" | "languageDefined" | "beforeWhitespace" | "never"
    autoIndent: 'None', // 控制编辑器在用户键入、粘贴、移动或缩进行时是否应自动调整缩进
    automaticLayout: true, // 自动布局
    codeLens: false, // 是否显示codeLens 通过 CodeLens，你可以在专注于工作的同时了解代码所发生的情况 – 而无需离开编辑器。 可以查找代码引用、代码更改、关联的 Bug、工作项、代码评审和单元测试。
    codeLensFontFamily: '', // codeLens的字体样式
    codeLensFontSize: 14, // codeLens的字体大小
    colorDecorators: false, // 呈现内联色彩装饰器和颜色选择器
    comments: {
      ignoreEmptyLines: true, // 插入行注释时忽略空行。默认为真。
      insertSpace: true, // 在行注释标记之后和块注释标记内插入一个空格。默认为真。
    }, // 注释配置
    contextmenu: true, // 启用上下文菜单
    columnSelection: false, // 启用列编辑 按下shift键位然后按↑↓键位可以实现列选择 然后实现列编辑
    autoSurround: 'never', // 是否应自动环绕选择
    copyWithSyntaxHighlighting: true, // 是否应将语法突出显示复制到剪贴板中 即 当你复制到word中是否保持文字高亮颜色
    cursorBlinking: 'Solid', // 光标动画样式
    cursorSmoothCaretAnimation: true, // 是否启用光标平滑插入动画  当你在快速输入文字的时候 光标是直接平滑的移动还是直接"闪现"到当前文字所处位置
    cursorStyle: 'UnderlineThin', // "Block"|"BlockOutline"|"Line"|"LineThin"|"Underline"|"UnderlineThin" 光标样式
    cursorSurroundingLines: 0, // 光标环绕行数 当文字输入超过屏幕时 可以看见右侧滚动条中光标所处位置是在滚动条中间还是顶部还是底部 即光标环绕行数 环绕行数越大 光标在滚动条中位置越居中
    cursorSurroundingLinesStyle: 'all', // "default" | "all" 光标环绕样式
    cursorWidth: 2, // <=25 光标宽度
    minimap: {
      enabled: true, // 是否启用预览图
    }, // 预览图设置
    folding: true, // 是否启用代码折叠
    links: true, // 是否点击链接
    overviewRulerBorder: false, // 是否应围绕概览标尺绘制边框
    renderLineHighlight: 'gutter', // 当前行突出显示方式
    roundedSelection: false, // 选区是否有圆角
    scrollBeyondLastLine: false, // 设置编辑器是否可以滚动到最后一行之后
    readOnly: false, // 是否为只读模式
    theme: 'vs-dark', // vs, hc-black, or vs-dark
  };

  // const handleChange = (value: any) => {
  //   setCode(value);
  //   console.log(value, 'change');
  // };

  // const editorDidMountHandle = (editor: any, monaco: any) => {
  //   editor.focus();
  // };

  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <Guide name={trim(name)} />
        <div style={{ width: '100%' }}>
          {/* <MonacoEditor
            width="1200"
            height="600"
            language={'javaScript'}
            theme="vs-dark"
            value={code}
            options={options}
            onChange={onChange}
            editorDidMount={editorDidMount}
          /> */}
          <MonacoEditor {...monacoEditorProps} />
        </div>
      </div>
    </PageContainer>
  );
};

export default HomePage;

// import * as monaco from 'monaco-editor'
// import { language } from 'monaco-editor/esm/vs/basic-languages/sql/sql'

// const { keywords } = language

// export default {
//   ...
//   mounted() {
//     this.initEditor()
//   },
//   methods: {
//     ...
//     registerCompletion() {
//       const _that = this
//       monaco.languages.registerCompletionItemProvider('sql', {
//         triggerCharacters: ['.', ...keywords],
//         provideCompletionItems: (model, position) => {
//           let suggestions = []

//           const { lineNumber, column } = position

//           const textBeforePointer = model.getValueInRange({
//             startLineNumber: lineNumber,
//             startColumn: 0,
//             endLineNumber: lineNumber,
//             endColumn: column,
//           })

//           const tokens = textBeforePointer.trim().split(/\s+/)
//           const lastToken = tokens[tokens.length - 1] // 获取最后一段非空字符串

//           if (lastToken.endsWith('.')) {
//             const tokenNoDot = lastToken.slice(0, lastToken.length - 1)
//             if (Object.keys(_that.hintData).includes(tokenNoDot)) {
//               suggestions = [..._that.getTableSuggest(tokenNoDot)]
//             }
//           } else if (lastToken === '.') {
//             suggestions = []
//           } else {
//             suggestions = [..._that.getDBSuggest(), ..._that.getSQLSuggest()]
//           }

//           return {
//             suggestions,
//           }
//         },
//       })
//     },
//     // 获取 SQL 语法提示
//     getSQLSuggest() {
//       return keywords.map((key) => ({
//         label: key,
//         kind: monaco.languages.CompletionItemKind.Enum,
//         insertText: key,
//       }))
//     },
//     getDBSuggest() {
//       return Object.keys(this.hintData).map((key) => ({
//         label: key,
//         kind: monaco.languages.CompletionItemKind.Constant,
//         insertText: key,
//       }))
//     },
//     getTableSuggest(dbName) {
//       const tableNames = this.hintData[dbName]
//       if (!tableNames) {
//         return []
//       }
//       return tableNames.map((name) => ({
//         label: name,
//         kind: monaco.languages.CompletionItemKind.Constant,
//         insertText: name,
//       }))
//     },
//     initEditor() {
//       if (this.$refs.codeContainer) {
//         this.registerCompletion()
//         // 初始化编辑器，确保dom已经渲染
//         this.monacoEditor = monaco.editor.create(this.$refs.codeContainer, {
//           value: '', // 编辑器初始显示文字
//           language: 'sql', // 语言
//           readOnly: this.readOnly, // 是否只读 Defaults to false | true
//           automaticLayout: true, // 自动布局
//           theme: this.theme, // 官方自带三种主题vs, hc-black, or vs-dark
//           minimap: {
//             // 关闭小地图
//             enabled: false,
//           },
//           tabSize: 2, // tab缩进长度
//         })
//       }
//       this.setValue(this.value)
//     },
//   }
// }
