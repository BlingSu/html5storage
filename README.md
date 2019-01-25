# html5storage

> 封装一个localstorage的插件 🍵

## 安装
使用npm

```bash
npm install html5storage --save
```

使用yarn

```bash
yarn add html5storage --save
```

## API
这里的api主要就是localstorage的交互方式。

### 使用方式
直接使用json，添加过期时间


#### 例子
```js
const storageLocal = new Html5Storage()

const storageSession = new Html5Storage('sessionStorage')
```

### set(key, val, option)

添加/修改数据，key（缓存的key），val（缓存的val），option（可选，过期时间）

#### 例子

```js
LocalStorage.set('token', '123'),
LocalStorage.set('token', '123', {day: 1}),
LocalStorage.set('token', '123', {exp: 24 * 3600}),
LocalStorage.set('token', '123', {exp: new Date(2019, 1, 22)})
```

### get(key)
获取数据， key（缓存的key）

#### 例子

```js
LocalStorage.get('token')
```

### remove(key)
删除缓存的数据 返回key

#### 例子

```js
LocalStorage.remove('token')
```


### clearExpires()
清空所有过期的缓存数据


### clear()
清空所有缓存数据, 也包含通过原始storage API添加的缓存


### reset(key, option)
重置过期时间

#### 例子

```js
LocalStorage.reset('token', {hour: 2})
```

### replace(key)
重置value, 过期时间不变

#### 例子

```js
LocalStorage.replace('token', '22222')
```


### add(key, val, option)
当key不存在或过期了才添加缓存数据

#### 例子

```js
LocalStorage.add('token', '123456');
LocalStorage.add('token', '123456', {day: 1});
```

## License
MIT
