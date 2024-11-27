`noRestrictedSyntaxPrototypeMethod` 是一个辅助函数，用于动态生成 ESLint 的 `no-restricted-syntax` 规则配置选项，目的是检查某些 ECMAScript 方法（例如 `Array.prototype.includes`）的使用，并生成相应的错误信息。这些配置可以通过选择器（`selector`）精确定位代码中的模式，结合定制化的提示信息（`message`）帮助开发者了解使用了不兼容特性的地方。

### **1. 函数输入参数**

- `method`：方法名称的字符串表示，例如 `Array.prototype.includes`。
- `esVersionName`：字符串，表示 ECMAScript 的版本名称，例如 `ES2016`。

### **2. 解析 `method` 参数**

```javascript
const [builtin, , name] = method.split('.');
```

- 这里将 `method` 按点号（`.`）分割为多个部分。
- `builtin`：表示内置对象名，例如 `Array`。
- `name`：表示方法名称，例如 `includes`。

对于 `Array.prototype.includes`：

- `builtin` 是 `Array`。
- `name` 是 `includes`。

### **3. 自定义错误信息**

```javascript
const message = `${esVersionName} method '${method}' is forbidden`;
```

- 动态生成错误提示信息，例如：
  - 如果 `method` 是 `Array.prototype.includes`，`esVersionName` 是 `ES2016`，那么错误信息为：
    ```
    ES2016 method 'Array.prototype.includes' is forbidden
    ```

### **4. 返回的规则配置**

返回一个数组，数组中包含两个对象，每个对象定义了一个 `selector` 和对应的 `message`。

```javascript
return [
  {
    selector: CallExpression[(callee.property.name = '${name}')],
    message,
  },
  {
    selector:
      MemberExpression[(object.object.name = '${builtin}')][(object.property.name = 'prototype')][
        (property.name = '${name}')
      ],
    message,
  },
];
```

#### **4.1. `selector`**

`selector` 是一个用于匹配代码结构的 CSS-like 语法。每个规则中定义了一个 `selector`，用于匹配特定的语法模式：

- **第一条规则**：

  ```javascript
  CallExpression[(callee.property.name = '${name}')];
  ```

  - 匹配的是对某个方法的调用，比如 `arr.includes(123)`。
  - 解析：
    - `CallExpression`：表示方法调用语法，例如 `foo.bar()`.
    - `[callee.property.name='${name}']`：表示调用的方法名必须是 `${name}`，如 `includes`。

- **第二条规则**：
  ```javascript
  MemberExpression[(object.object.name = '${builtin}')][(object.property.name = 'prototype')][
    (property.name = '${name}')
  ];
  ```
  - 匹配的是对某个方法的显式访问，比如 `Array.prototype.includes`。
  - 解析：
    - `MemberExpression`：表示成员表达式，例如 `foo.bar`。
    - `[object.object.name='${builtin}']`：表示外层对象名必须是 `${builtin}`，如 `Array`。
    - `[object.property.name='prototype']`：表示访问了 `prototype` 属性。
    - `[property.name='${name}']`：表示最终访问的方法名必须是 `${name}`，如 `includes`。

#### **4.2. `message`**

当匹配到 `selector` 中的模式时，会触发 ESLint 报告，并显示自定义的 `message` 提示。

### **5. 示例分析**

假设我们调用：

```javascript
noRestrictedSyntaxPrototypeMethod('Array.prototype.includes', 'ES2016');
```

返回值如下：

```javascript
[
  {
    selector: "CallExpression[callee.property.name='includes']",
    message: "ES2016 method 'Array.prototype.includes' is forbidden",
  },
  {
    selector:
      "MemberExpression[object.object.name='Array'][object.property.name='prototype'][property.name='includes']",
    message: "ES2016 method 'Array.prototype.includes' is forbidden",
  },
];
```

#### **解释匹配场景**

1. 第一条规则：

   - 匹配 `arr.includes(123)`。
   - 这是对 `includes` 方法的直接调用。
   - ESLint 检查到后会抛出错误，提示：
     ```
     ES2016 method 'Array.prototype.includes' is forbidden
     ```

2. 第二条规则：
   - 匹配 `Array.prototype.includes`。
   - 这是对 `Array.prototype.includes` 的显式访问。
   - ESLint 检查到后也会抛出相同的错误提示。

### **6. 函数作用总结**

- **动态生成 ESLint 配置**：为 `no-restricted-syntax` 规则提供配置，用于检测特定语法模式。
- **定位不兼容特性**：在代码中精确定位如 `Array.prototype.includes` 等特性，帮助开发者发现并修复潜在的不兼容问题。
- **支持多场景匹配**：通过 `CallExpression` 和 `MemberExpression` 的两种选择器，确保不仅方法调用被检测到，显式访问也会触发错误。

这种设计让规则生成非常灵活，能够动态适配不同的特性和 ECMAScript 版本需求。
