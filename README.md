ThreeCore
================
### 对threejs进行二次封装（尚处于初版，功能还在持续开发中）
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
##### 4. 函数简单介绍          

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