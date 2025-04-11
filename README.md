ThreeCore
================
### 对threejs进行二次封装
#### 如何使用
##### 1. 安装
    yarn add three-core --save
    npm install three-core --save
##### 2. 引入    
    import ThreeCore from 'three-core'    
##### 3. 使用      
```
let threeCore:ThreeCore        
threeCore = new ThreeCore({
    container: '#container',
    lightIntensity: 3,
    z: 10
})     
```      
##### 4. 初始化参数介绍          

| 字段名      | 是否必传 | 类型   | 描述                                                                                      |
| ----------- | -------- | ------ | ----------------------------------------------------------------------------------------- |
| container    | 是       | string / HTMLElement | 三维场景初始化的容器，可以是css选择器或者dom |
| width  | 否       | number | 场景宽度，不传则默认为容器宽度                                                                |
| height  | 否       | number | 场景高度，不传则默认为容器宽度                    |
| gizmosVisible | 否       | boolean | 是否显示 Gizmo，默认为 true                                                        |
| fov | 否       | number | 摄像机视锥体垂直视野角度，默认80                                                        |
| near | 否       | number | 摄像机的近裁剪面，默认0.1                                                        |
| far | 否       | number | 摄像机的远裁剪面，默认1000                                                       |
| x | 否       | number | 摄像机的 X 坐标，默认0                                                       |
| y | 否       | number | 摄像机的 Y 坐标，默认0                                                       |
| z | 否       | number | 摄像机的 Z 坐标，默认400                                                       |
| backgroundColor | 否       | string | 场景背景色，默认为'#000'                                                       |
| backgroundImage | 否       | string | 场景背景图片，要把图片放到public文件夹目录下，路径为./xxxxx                                             |
| skyBox | 否       | string | 天空盒背景图，要把图片放到public文件夹目录下，路径为./xxxxx                                             |
| adaptive | 否       | boolean | 当容器大小发生变化时，是否自适应调整场景大小，默认为true                                             |
| needComposer | 否       | boolean | 是否需要后期处理，默认为false                                             |
| lightIntensity | 否       | number | 灯光强度，默认为1                                             |
| lightColor | 否       | string | 灯光颜色 默认为#ffffff                                             |
| needControl | 否       | boolean | 是否需要控制器 默认为true                                             |
| enableRotate | 否       | boolean | 是否允许旋转 默认为true                                             |
| enableZoom | 否       | boolean | 是否允许缩放 默认为true                                             |
| enablePan | 否       | boolean | 是否允许平移 默认为true                                             |
| enableRotateX | 否       | boolean | 是否允许X轴旋转 默认为true                                             |
| enableRotateY | 否       | boolean | 是否允许Y轴旋转 默认为true                                             |
##### 5. 函数简单介绍          

| 函数名                | 简单描述（具体函数参数可在使用时看ts提示）                           |
| --------------------- | ------------------------------ |
| createScene            | 创建场景（初始化场景，添加灯光，摄像机，渲染器，控制器）                      |
| refresh              | 手动重置场景大小（默认根据div大小自适应）    |
| render   | 手动渲染，依自己情况而定使用    |
| changeCameraPosition   | 设置相机位置及朝向    |
| createPanel   | 创建面板并添加到场景中    |
| createLineByModel   | 通过两个模型位置创建一条线    |
| addMesh   | 向场景中添加模型    |
| getMesh   | 获取模型    |
| moveMesh   | 移动模型至指定位置    |
| translateMesh   | 偏移模型    |
| moveMeshAnimate   | 通过动画移动模型至指定位置    |
| stopAnimate   | 停止单个动画或所有动画    |
| removeMesh   | 移除模型    |
| removeMeshesByIncludesKey   | 按名称包含特定关键词删除模型    |
| toggleMeshShow   | 指定模型是否显示    |
| setMeshCenter   | 设置单个mesh位置居于屏幕中心    |
| setGroupCenter   | 设置模型组位置居于屏幕中心    |
| loadFbx   | 加载Fbx模型    |
| loadObj   | 加载Obj模型    |
| outlineModel   | 模型添加发光边框    |
| getMeshSize   | 获取模型尺寸    |
| getWorldPosition   | 获取模型世界坐标    |
| explodeModel   | 模型爆炸    |
| showProfile   | 显示模型切面    |
| hideProfile   | 隐藏模型切面    |
| testLoadPointCloud   | 测试加载点云数量，主要用于性能测试    |
| addPoints   | 加载点云,点云颜色支持纯色，渐变色，区域色三种模式    |
| setModelType   | 设置模型显示类型,支持点,线,体三种模式    |
| addModelTexture   | 设置模型贴图    |
| getClickedModel   | 获取鼠标点击的模型    |
| showInfo   | 目标模型显示一个2D信息,支持html字符串    |
| hideInfo   | 目标模型隐藏2D信息    |