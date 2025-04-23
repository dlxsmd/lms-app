import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  initialCode: string;
  language: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

// 言語マッピング
const languageMapping: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  cpp: "cpp",
  c: "c",
  csharp: "csharp",
  ruby: "ruby",
  php: "php",
  swift: "swift",
  rust: "rust",
  go: "go",
  kotlin: "kotlin",
};

export const languageTemplates: Record<string, string> = {
  python: `# 標準入力からの入力を受け取る例
input_value = input()
print(f"入力された値: {input_value}")`,

  javascript: `// 標準入力からの入力を受け取る例
const input_value = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(\`入力された値: \${input_value}\`);`,

  java: `public class Main {
    public static void main(String[] args) {
        // 標準入力からの入力を受け取る例
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        String inputValue = scanner.nextLine();
        System.out.println("入力された値: " + inputValue);
        scanner.close();
    }
}`,

  cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // 標準入力からの入力を受け取る例
    string input_value;
    getline(cin, input_value);
    cout << "入力された値: " << input_value << endl;
    return 0;
}`,

  c: `#include <stdio.h>

int main() {
    // 標準入力からの入力を受け取る例
    char input_value[1000];
    fgets(input_value, sizeof(input_value), stdin);
    printf("入力された値: %s", input_value);
    return 0;
}`,

  csharp: `using System;

class Program {
    static void Main(string[] args) {
        // 標準入力からの入力を受け取る例
        string inputValue = Console.ReadLine();
        Console.WriteLine($"入力された値: {inputValue}");
    }
}`,

  ruby: `# 標準入力からの入力を受け取る例
input_value = gets.chomp
puts "入力された値: #{input_value}"`,

  php: `<?php
// 標準入力からの入力を受け取る例
$input_value = trim(fgets(STDIN));
echo "入力された値: " . $input_value . "\n";
?>`,

  swift: `// 標準入力からの入力を受け取る例
if let inputValue = readLine() {
    print("入力された値: \\(inputValue)")
}`,

  rust: `use std::io;

fn main() {
    // 標準入力からの入力を受け取る例
    let mut input_value = String::new();
    io::stdin().read_line(&mut input_value).expect("入力エラー");
    println!("入力された値: {}", input_value.trim());
}`,

  go: `package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    // 標準入力からの入力を受け取る例
    scanner := bufio.NewScanner(os.Stdin)
    scanner.Scan()
    inputValue := scanner.Text()
    fmt.Printf("入力された値: %s\n", inputValue)
}`,

  kotlin: `fun main() {
    // 標準入力からの入力を受け取る例
    val inputValue = readLine()
    println("入力された値: $inputValue")
}`,
};

export default function CodeEditor({
  initialCode,
  language,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  const [code, setCode] = useState(
    initialCode || languageTemplates[language] || ""
  );

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      onChange(value);
    }
  };

  // エディタが読み込まれる前の処理
  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme("customTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1e1e1e",
      },
    });
  };

  return (
    <div className="rounded-md overflow-hidden border border-gray-200">
      <Editor
        height="400px"
        defaultLanguage={languageMapping[language]}
        language={languageMapping[language]}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        beforeMount={handleEditorWillMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          readOnly: readOnly,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          wordWrap: "on",
          suggest: {
            showKeywords: true,
          },
        }}
      />
    </div>
  );
}
