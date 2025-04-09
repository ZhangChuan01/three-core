import * as THREE from 'three'
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import * as TWEEN from '@tweenjs/tween.js'
import axios from 'axios'
import localforage from 'localforage'
interface Params {
  container: keyof HTMLElementTagNameMap | HTMLElement
  width?: number
  height?: number
  x?: number
  y?: number
  z?: number
  gizmosVisible?: boolean
  fov?: number
  near?: number
  far?: number
  backgroundColor?: string
  backgroundImage?: string
  adaptive?: boolean
  needComposer?: boolean
  lightIntensity?: number
  lightColor?: string
  skyBox?: string
}
interface AreaColor {
  colorList: {
    min: number
    max: number
    color: string
  }[]
  valueType: string
  defaultColor?: string
}
interface LinearColor {
  colors: string[]
  positions: number[]
  minValue: number
  maxValue: number
  valueType: string
}
class ThreeCore {
  private initParams: Params
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private controls: ArcballControls
  private container: HTMLElement
  private width: number
  private height: number
  private x: number
  private y: number
  private z: number
  private fov: number
  private near: number
  private far: number
  private gizmosVisible: boolean
  private backgroundImage: string
  private skyBox: string
  private adaptive: boolean
  private needComposer: boolean
  private lightIntensity: number
  private lightColor: string
  private material: THREE.LineBasicMaterial
  private animates: { [key: string]: number }
  private fbxLoader: FBXLoader
  private composer: EffectComposer
  private outlinePass: OutlinePass
  private renderPass: RenderPass
  private outlineModels: THREE.Object3D[]
  private modelMaps: { [key: string]: THREE.Mesh }
  private meshAnimates: { name: string, tween: TWEEN.Tween<THREE.Vector3> }[]
  private staticMapping: { [key: string]: any }
  /**
 * @description 初始化
 * @param {Params} scene - 初始化参数对象
 * @param {string} scene.container - css选择器或者HTML元素
 * @param {number} scene.width - 渲染器的宽度，不传则默认为元素自身宽度
 * @param {number} scene.height - 渲染器的高度，不传则默认为元素自身高度
 * @param {boolean} scene.gizmosVisible - 是否显示 Gizmo，默认为 true
 * @param {number} scene.fov - 摄像机视锥体垂直视野角度，默认80
 * @param {number} scene.near - 摄像机的近裁剪面，默认0.1
 * @param {number} scene.far - 摄像机的远裁剪面，默认1000
 * @param {number} scene.x - 摄像机的 Y 坐标，默认0
 * @param {number} scene.y - 摄像机的 Y 坐标，默认0
 * @param {number} scene.z - 摄像机的 Z 坐标，默认400,当模型单位为mm时，将此参数调至个位数
 * @param {string} scene.backgroundColor - 场景背景色，默认为'#000
 * @param {string} scene.backgroundImage - 场景背景图片，要把图片放到public文件夹目录下，路径为./xxxxx
 * @param {string} scene.skyBox - 天空盒背景图，要把图片放到public文件夹目录下，路径为./xxxxx
 * @param {boolean} scene.adaptive - 是否自适应，默认为true
 * @param {boolean} scene.needComposer - 是否需要后期处理，默认为false
 * @param {number} scene.lightIntensity - 灯光强度，默认为1
 * @param {string} scene.lightColor - 灯光颜色 默认为#ffffff
 * 
 */
  constructor(scene: Params) {
    if (!scene.container) {
      console.error('container,width,height为必填字段')
      return
    }
    this.initParams = scene
    this.scene = new THREE.Scene()
    if(typeof scene.container === 'string'){
      this.container = document.querySelector(scene.container) as HTMLElement
    }else {
      this.container = scene.container
    }
    if(scene.width){
      this.width = scene.width
    }else {
      this.width = this.container.offsetWidth
    }
    if(scene.height){
      this.height = scene.height
    } else {
      this.height = this.container.offsetHeight
    }
    this.gizmosVisible = scene.gizmosVisible ?? true
    this.fov = scene.fov ?? 80
    this.near = scene.near ?? 0.1
    this.far = scene.far ?? 1000
    this.x = scene.x ?? 0
    this.y = scene.y ?? 0
    this.z = scene.z ?? 400
    this.lightIntensity = scene.lightIntensity ?? 1
    this.lightColor = scene.lightColor ?? '#ffffff'
    this.scene.background = new THREE.Color(scene.backgroundColor ?? '#000')
    this.backgroundImage = scene.backgroundImage ?? ''
    this.skyBox = scene.skyBox ?? ''
    this.adaptive = scene.adaptive ?? true
    this.needComposer = scene.needComposer ?? false
    this.staticMapping = {
      panelDirection: {
        horizontal: 0.5 * Math.PI,
        vertical: 1 * Math.PI
      }
    }

    // this.models = []
    this.modelMaps = {}
    this.material = new THREE.LineBasicMaterial({
      color: 0x00ffff
    })
    this.animates = {}
    this.fbxLoader = new FBXLoader()
    this.outlineModels = []
    this.meshAnimates = []
  }
  private isWebGLAvailable(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
    } catch (e) {
      return false
    }
  }
  /**
 * 初始化场景，添加灯光，摄像机，渲染器，控制器
 *
 */
  createScene() {
    if (!this.isWebGLAvailable()) {
      this.container.innerHTML = '浏览器不支持webgl'
      return
    }
    this.initScene()
    this.addPoint()
    this.addCamera()
    this.addRenderer()
    this.addControl()
    if(this.backgroundImage) this.addBg()
    if(this.skyBox) this.addSkyBox()
  }
  private initScene() {
    this.scene.fog = new THREE.Fog(0xffffff, 0, 750)
    if(this.adaptive){
      const observerContainer = new ResizeObserver(() => {
        if (!this.initParams.width && !this.initParams.height) {
          this.refresh({ width: Math.floor(this.container.offsetWidth), height: Math.floor(this.container.offsetHeight) })
        }
      })
      observerContainer.observe(this.container)
    }
  }
  private addBg() {
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(this.backgroundImage, texture => {
      texture.colorSpace = THREE.SRGBColorSpace
      const canvasAspect = this.width / this.height  //第1步：计算出画布宽高比
      const bgTexture = texture
      const imgAspect = bgTexture.image.width / bgTexture.image.height  //第2步：计算出背景图宽高比
      const resultAspect = imgAspect / canvasAspect  //第3步：计算出最终背景图宽缩放宽高比
      //第4步：设置背景图纹理的偏移和重复
      bgTexture.offset.x = resultAspect > 1 ? (1 - 1 / resultAspect) / 2 : 0
      bgTexture.repeat.x = resultAspect > 1 ? 1 / resultAspect : 1

      bgTexture.offset.y = resultAspect > 1 ? 0 : (1 - resultAspect) / 2
      bgTexture.repeat.y = resultAspect > 1 ? 1 : resultAspect
      this.scene.background = texture
    })
  }
  private addSkyBox() {
    // 创建一个完整的天空盒，填入几何模型和材质的参数
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(this.skyBox,
      texture => {
        console.log('texture', texture)
        const crt = new THREE.WebGLCubeRenderTarget(texture.image.height)
        crt.fromEquirectangularTexture(this.renderer, texture)
        this.scene.background = crt.texture
      }
    )
  }
  private addPoint() {
    const light = new THREE.AmbientLight(0x404040) // 柔和的白光
    this.scene.add(light)
    const directionalLight = new THREE.DirectionalLight(this.lightColor, this.lightIntensity)
    this.scene.add(directionalLight)
    const point1 = new THREE.DirectionalLight(this.lightColor, this.lightIntensity)
    point1.position.set(0, 30, 80)
    this.scene.add(point1)
    const point2 = new THREE.DirectionalLight(this.lightColor, this.lightIntensity)
    point2.position.set(0, 30, -80)
    this.scene.add(point2)
    const point3 = new THREE.DirectionalLight(this.lightColor, this.lightIntensity)
    point3.position.set(80, 30, 0)
    this.scene.add(point3)
    const point4 = new THREE.DirectionalLight(this.lightColor, this.lightIntensity)
    point4.position.set(-80, 30, 0)
    this.scene.add(point4)
  }
  private addCamera() {
    this.camera = new THREE.PerspectiveCamera(this.fov, this.width / this.height, this.near, this.far)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
    this.camera.position.x = this.x
    this.camera.position.y = this.y
    this.camera.position.z = this.z
  }
  private addRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      alpha: true
    })
    this.renderer.setSize(this.width, this.height)
    this.container.appendChild(this.renderer.domElement)
    if(this.needComposer) this.initComposer()
  }
  private initComposer() {
    // 创建一个EffectComposer（效果组合器）对象，然后在该对象上添加后期处理通道。
    this.composer = new EffectComposer(this.renderer)
    console.log('composer', this.composer, this.scene)
    // 新建一个场景通道  为了覆盖到原理来的场景上
    this.renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(this.renderPass)
    // 物体边缘发光通道
    this.outlinePass = new OutlinePass(new THREE.Vector2(this.width, this.height), this.scene, this.camera)
    this.outlinePass.renderToScreen = true
    this.outlinePass.edgeStrength = 10.0 // 边框的亮度
    this.outlinePass.edgeGlow = 1// 光晕[0,1]
    this.outlinePass.usePatternTexture = false // 是否使用父级的材质
    this.outlinePass.edgeThickness = 1 // 边框宽度
    this.outlinePass.downSampleRatio = 1 // 边框弯曲度
    this.outlinePass.pulsePeriod = 0 // 呼吸闪烁的速度
    this.outlinePass.visibleEdgeColor.set('#00FF70') // 呼吸显示的颜色
    this.outlinePass.hiddenEdgeColor = new THREE.Color(0, 1, 0) // 呼吸消失的颜色
    this.outlinePass.clear = true
    this.outlinePass.selectedObjects = []
    this.composer.addPass(this.outlinePass)
    const outputPass = new OutputPass()
    this.composer.addPass(outputPass)
    // 自定义的着色器通道 作为参数
    // const effectFXAA = new ShaderPass(FXAAShader)
    // effectFXAA.uniforms.resolution.value.set(1 / this.width, 1 / this.height)
    // const animateNumer = requestAnimationFrame(this.render)
    // setTimeout(() => {
    //   cancelAnimationFrame(animateNumer)
    // }, 10000)
  }
  private addControl() {
    // 控制器
    this.controls = new ArcballControls(this.camera as THREE.Camera, this.renderer?.domElement as HTMLElement, this.scene)
    this.controls.setGizmosVisible(this.gizmosVisible)
    this.controls.addEventListener('change', () => {
      // const target = new THREE.Vector3()
      // this.camera.getWorldDirection(target)
      // target.add(this.camera.position)
      // console.log('target', target,this.camera.up,this.controls.target)
      this.render()
    })
  }
  /**
   * 手动重置场景大小
   */
  refresh({ width, height }: { width: number, height: number }) {
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.render()
  }
  /**
   * 手动渲染
   */
  render() {
    setTimeout(() => {
      // console.log('renderrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
      if (this.composer) {
        this.composer.render()
      } else {
        this.scene.updateMatrixWorld(true)
        this.renderer.render(this.scene, this.camera)
      }
    }, 300)
  }
  /**
   * 设置相机位置及朝向
   * @param {Params} object
   * @param {object} object.position - x坐标, y坐标, z坐标
   * @param {object} object.up - x,y,z
   * @param {lookAt} object.lookAt - x,y,z
   */
  changeCameraPosition({ position, up, lookAt }: { position?: { x?: number, y?: number, z?: number },
    up?: { x?: number, y?: number, z?: number },lookAt?: { x?: number, y?: number, z?: number } }) {
    // console.log('this.camera.position', this.camera.position)
    const cameraPosition = this.camera.position
    cameraPosition.x = position?.x ?? cameraPosition.x
    cameraPosition.y = position?.y ?? cameraPosition.y
    cameraPosition.z = position?.z ?? cameraPosition.z
    const cameraUp = this.camera.up
    cameraUp.x = up?.x ?? cameraUp.x
    cameraUp.y = up?.y ?? cameraUp.y
    cameraUp.z = up?.z ?? cameraUp.z
    this.camera.lookAt(new THREE.Vector3(lookAt?.x ?? 0, lookAt?.y ?? 0, lookAt?.z ?? 0))
    this.render()
  }
  /**
   * 
   * @description 创建面板并添加到场景中
   * @param {Params} object
   * @param {number} object.width - 面板宽度
   * @param {number} object.height - 面板高度
   * @param {string} object.color - 面板颜色
   * @param {number} object.x - 面板x坐标
   * @param {number} object.y - 面板y坐标
   * @param {number} object.z - 面板z坐标
   * @param {boolean} object.receiveShadow - 面板是否接受阴影
   * @param {string} object.direction - 面板方向，两个可选值：horizontal(横向)和vertical(纵向)，默认为horizontal
   */
  createPanel({ width = 100, height = 100, color = '#0C76B9', x = 0, y = 0, z = 0, receiveShadow = false, direction = 'horizontal' }: 
    { width?: number, height?: number,color?:string,x?:number,y?:number,z?:number,receiveShadow?:boolean,direction?: string }) {
    // 创建地面
    const planeGeometry = new THREE.PlaneGeometry(width, height)
    const planeMaterial = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = this.staticMapping.panelDirection[direction],
    plane.position.x = x
    plane.position.y = y
    plane.position.z = z
    // 地面接受阴影
    plane.receiveShadow = receiveShadow
    this.scene.add(plane)
  }
  /**
   * @description 通过两个模型位置创建一条线
   * @param {string} name1 第一个模型的名称
   * @param {string} name2 第二个模型的名称
   */
  createLineByModel(name1: string, name2: string) {
    const position1 = this.getMesh(name1).getWorldPosition(new THREE.Vector3())
    const position2 = this.getMesh(name2).getWorldPosition(new THREE.Vector3())
    const points = [ position1, position2 ]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, this.material)
    line.name = `line-${name1}-${name2}`
    this.scene.add(line)
  }
  /**
   * @description 向场景中添加模型
   * @param {THREE.Mesh} model 要添加的模型
   * @param {boolean} outline 是否添加发光边框（如果需要初始化时needComposer设置为true）
   */
  addMesh(model: THREE.Mesh, outline = false) {
    // console.log('addd', model.name)
    this.scene.add(model)
    // this.models.push(model)
    this.modelMaps[model.name] = model
    if (outline) {
      this.outlineModel(model)
    }
  }
  /**
   * @description 获取模型
   * @param {string | THREE.Mesh} mesh 要获取的模型名称或者模型本身
   * @param {boolean} needDelete 是否需要删除
   */
  getMesh(mesh: string | THREE.Mesh, needDelete?: boolean): THREE.Object3D | undefined {
    console.log('getMesh', mesh)
    let key = 'name'
    if (typeof mesh === 'string'){
      if (this.modelMaps[mesh]) {
        if (needDelete) {
          this.scene.remove(this.modelMaps[mesh])
        }
        return this.modelMaps[mesh]
      }
    }else{
      key = 'uuid'
    }
    function findModel(models: THREE.Object3D[]): THREE.Object3D | undefined {
      for (const item of models) {
        if (item[key] === (key === 'name' ? mesh : mesh.uuid)) {
          if (needDelete) {
            item.parent.remove(mesh)
          }
          return item
        } else {
          if (item.children && item.children.length) {
            const result = findModel(item.children)
            if (result) {
              if (needDelete) {
                item.remove(result)
              }
              return result
            }
          }
        }
      }
    }
    return findModel(this.scene.children)
  }
  /**
   * @description 移动模型至指定位置
   * @param {Params} object
   * @param {string} object.name - 模型名称
   * @param {number} object.x - 模型x坐标
   * @param {number} object.y - 模型y坐标
   * @param {number} object.z - 模型z坐标
   */
  moveMesh({ name, x, y, z }: { name: string, x?: number, y?: number, z?: number }) {
    const mesh = this.getMesh(name)
    // console.log('mesh', name, x, y, z, mesh)
    if (mesh) {
      mesh.position.set(x ?? mesh.position.x, y ?? mesh.position.y, z ?? mesh.position.z)
    }
  }
  /**
   * @description 通过动画移动模型
   * @param {Params} object
   * @param {string} object.name - 模型名称
   * @param {number} object.x - 模型x坐标
   * @param {number} object.y - 模型y坐标
   * @param {number} object.z - 模型z坐标
   * @param {number} object.duration - 动画持续时长，默认为1000即1秒
   */
  moveMeshAnimate({ name, x, y, z, duration = 1000 }: { name: string, duration?: number, x?: number, y?: number, z?: number }) {
    const mesh = this.getMesh(name)
    if (mesh) {
      const tween = new TWEEN.Tween(mesh.position)
      console.log('tween', tween)
      tween.to({ x: x === undefined ? mesh.position.x : x, y: y === undefined ? mesh.position.y : y, z: z === undefined ? mesh.position.z : z }, duration)  // 设置目标位置和动画持续时间
        .easing(TWEEN.Easing.Linear.None)  // 设置缓动函数，这里使用了一个简单的二次缓动函数
        .onUpdate(() => {  // 在动画更新时的回调函数，用于更新渲染
          // 更新渲染
          this.render()
        }).onComplete(() => {
          if (this.animates[name]) {
            cancelAnimationFrame(this.animates[name])
            delete this.animates[name]
            const index = this.meshAnimates.findIndex(item => item.name === name)
            if (index > -1) {
              this.meshAnimates.splice(index, 1)
            }
          }
        }).start()  // 开始动画
      const animate = () => {
        const animateNumer = requestAnimationFrame(animate)
        if (this.animates[name]) {
          cancelAnimationFrame(this.animates[name])
        }
        this.animates[name] = animateNumer
        tween.update()
      }
      animate()
      this.meshAnimates.push({ name, tween })
    }
  }
  /**
   * @description 停止动画
   * @param {string} name 要停止的动画名称（模型名称），不传则停止所有动画
   */
  stopAnimate(name?: string) {
    if (name) {
      const index = this.meshAnimates.findIndex(item => item.name === name)
      if (index > -1) {
        cancelAnimationFrame(this.animates[this.meshAnimates[index].name])
        delete this.animates[this.meshAnimates[index].name]
        this.meshAnimates.splice(index, 1)
      }
    } else {
      this.meshAnimates.forEach(item => {
        item.tween.pause()
        if (this.animates[item.name]) {
          cancelAnimationFrame(this.animates[item.name])
          delete this.animates[item.name]
        }
      })
    }
  }
  /**
   * @description 移除模型
   * @param {string | THREE.Mesh} removedMesh 要删除的模型名称,传入模型名称或者模型本身
   */
  removeMesh(removedMesh: string | THREE.Mesh) {
    console.log('removeMesh', removedMesh)
    const mesh = this.getMesh(removedMesh, true) as THREE.Mesh
    console.log('rrrrrrrrrrrr', mesh)
    if (mesh) {
      this.gemometryDispose(mesh)
      // this.scene.remove(mesh)
      if (this.modelMaps[mesh.name]) {
        delete this.modelMaps[mesh.name]
      }
      const index = this.outlineModels.findIndex(item => item.name === mesh.name)
      if (index > -1) {
        this.outlineModels.splice(index, 1)
      }
    }
  }
  /**
   * @description 设置单个mesh位置居于屏幕中心
   * @param {THREE.Mesh} mesh 要设置的模型
   */
  setMeshCenter(mesh: THREE.Mesh) {
    mesh.geometry.center()
  }
  /**
   * @description 设置模型组位置居于屏幕中心
   * @param {THREE.Object3D} object 要设置的模型
   */
  setGroupCenter(object: THREE.Object3D) {
    object.updateWorldMatrix(true, true)
    const box = new THREE.Box3().setFromObject(object)
    const center = new THREE.Vector3()
    box.getCenter(center)
    // 将模型位置偏移，使中心对齐原点
    object.position.sub(center)
    // 再次更新世界矩阵（可选，确保后续操作准确）
    object.updateWorldMatrix(true, true)
  }
  /**
   * @description 按名称包含特定关键词删除模型
   * @param {string} key 关键词
   */
  removeMeshesByIncludesKey(key: string) {
    try {
      for (let i = this.scene.children.length - 1; i >= 0; i--) {
        if (this.scene.children[i].name.includes(key)) {
          this.removeMesh(this.scene.children[i].name)
        }
      }
    } catch (error) {
      console.log('removeMeshesByIncludesKey', error)
    }
    this.render()
  }
  private gemometryDispose(mesh: THREE.Mesh) {
    if (mesh.geometry) {
      mesh.geometry.dispose()
      // mesh.geometry.attributes = null
    }
    if (mesh.children) {
      mesh.children.forEach((value: any) => {
        this.gemometryDispose(value)
        mesh.remove(value)
      })
    }
  }
  /**
   * @description 指定模型是否显示
   * @param {string} name 模型名称
   * @param {boolean} visible 是否显示
   */
  toggleMeshShow(name: string, visible: boolean) {
    const mesh = this.getMesh(name)
    // console.log('toggleMesh', mesh)
    if (mesh) {
      mesh.visible = visible
      this.render()
    }
  }
  private async getModelUrl(url: string): Promise<string> {
    const name = url.substring(url.lastIndexOf('/') + 1)
    const model = await localforage.getItem(name)
    return new Promise(resolve => {
      if (model && model instanceof Blob) {
        const URL = window.URL || window.webkitURL
        resolve(URL.createObjectURL(model))
      } else {
        axios({
          url,
          method: 'get',
          responseType: 'blob'
          // onDownloadProgress: function (progressEvent) {
          //   // 对原生进度事件的处理
          //   const num = (progressEvent.loaded / progressEvent.total! * 100).toFixed(1)
          //   console.log('已加载' + num + '%')
          // }
        }).then(res => {
          localforage.setItem(name, res.data).then(() => {
            const URL = window.URL || window.webkitURL
            resolve(URL.createObjectURL(res.data))
          })
        }).catch(err => {
          console.error('请求出错', err)
          resolve('')
        })
      }
    })
  }
  /**
   * @description 加载Fbx模型
   * @param {Params} object 
   * @param {string} object.url 模型地址
   * @param {boolean} object.addToScene 是否添加到场景
   * @param {boolean} object.needCenter 是否需要居中
   * @param {boolean} object.needCache 是否需要缓存
   * @param {boolean} object.outline 是否需要边框
   * @param {string} object.name 重命名模型
   * @returns 
   */
  async loadFbx({ url = '', needCenter, addToScene = true, needCache = false, outline = false,name }: 
    { url: string, needCenter?: boolean, addToScene?: boolean, needCache?: boolean, outline?: boolean,name?: string }): Promise<THREE.Object3D> {
    let modelUrl = url
    if (needCache) {
      modelUrl = await this.getModelUrl(url)
    }
    // console.log('modelUrl', modelUrl)
    return new Promise((resolve, reject) => {
      if (!modelUrl) {
        reject(new Error('模型不存在'))
      } else {
        this.fbxLoader.load(modelUrl, object => {
          console.log('loadFbx', object)
          if(name){
            object.name = name
          }
          // this.models.push(object)
          this.modelMaps[object.name] = object
          // object.traverse(child => {
          //   if (child instanceof THREE.Mesh) {
          //     child.castShadow = false  //投射阴影，消耗性能
          //     child.receiveShadow = false //地面接受阴影
          //   }
          // })
          if (outline) {
            this.outlineModel(object)
          }
          if (needCenter) {
            this.setGroupCenter(object)
          }
          if (addToScene) {
            this.scene.add(object)
            this.render()
          }
          resolve(object)
        }, () => {
          // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        }, err => {
          console.log('err', err)
          reject(new Error('加载出错'))
        })
      }
    })
  }
  /**
   * @description 加载Obj模型
   * @param {Params} object 
   * @param {string} object.url 模型地址
   * @param {boolean} object.addToScene 是否添加到场景
   * @param {boolean} object.needCenter 是否需要居中
   * @param {boolean} object.needCache 是否需要缓存
   * @param {boolean} object.outline 是否需要边框
   * @param {string} object.name 重命名模型
   * @returns 
   */
  async loadObj({ url = '', addToScene = true, needCache = false, needCenter, outline = false, name }: 
    { url: string, addToScene?: boolean, needCache?: boolean, needCenter?: boolean, outline?: boolean,name?: string }): Promise<THREE.Object3D> {
    let modelUrl = url
    if (needCache) {
      modelUrl = await this.getModelUrl(url)
    }
    return new Promise((resolve, reject) => {
      if (!modelUrl) {
        reject(new Error('模型不存在'))
      } else {
        const loader = new OBJLoader()
        loader.load(modelUrl, (object: THREE.Object3D) => {
          console.log('loadObj', object)
          if (name) {
            object.name = name
          }
          this.modelMaps[object.name] = object
          // object.translateX(x)
          // object.scale.multiplyScalar(scale)
          if (outline) {
            this.outlineModel(object)
          }
          if (needCenter) {
            this.setGroupCenter(object)
          }
          if (addToScene) {
            this.scene.add(object)
            this.render()
          }
          resolve(object)
        })
      }
    })
  }
  /**
   * @description 模型添加发光边框
   * @param {THREE.Object3D} selectedObjects 选中的模型
   */
  outlineModel(selectedObjects: THREE.Object3D) {
    // console.log('selected111', selectedObjects)
    if (!this.needComposer) return
    this.outlineModels.push(selectedObjects)
    console.log('outlineModels', this.outlineModels)
    this.outlinePass.selectedObjects = this.outlineModels
  }
  /**
   * @description 获取模型尺寸
   * @param {THREE.Object3D} model 要获取的模型
   */
  getMeshSize(model: THREE.Object3D) {
    const box = new THREE.Box3()
    box.setFromObject(model)
    return box.getSize(new THREE.Vector3())
  }
  private getWorldCenterPosition(box: THREE.Box3, scalar = 0.5): THREE.Vector3 {
    return new THREE.Vector3().addVectors(box.max, box.min).multiplyScalar(scalar)
  }
  /**
   * @description 获取模型世界坐标
   * @param {THREE.Mesh} mesh 
   */
  getWorldPosition(mesh: THREE.Mesh) {
    // console.log('getWorldPosition', mesh)
    return mesh.getWorldPosition(new THREE.Vector3())
  }
  private initExplodeModel(modelObject: THREE.Object3D) {
    console.log('initExplodeModel')
    if (!modelObject) return
    modelObject.initExplode = true
    // 计算模型中心
    const explodeBox = new THREE.Box3()
    explodeBox.setFromObject(modelObject)
    const explodeCenter = this.getWorldCenterPosition(explodeBox)

    const meshBox = new THREE.Box3()

    // 遍历整个模型，保存数据到userData上，以便爆炸函数使用
    modelObject.traverse(value => {
      if ((value as THREE.Line).isLine || (value as THREE.Sprite).isSprite) return
      if ((value as THREE.Mesh).isMesh) {
        meshBox.setFromObject(value)

        const meshCenter = this.getWorldCenterPosition(meshBox)
        // 爆炸方向
        value.userData.worldDir = new THREE.Vector3()
          .subVectors(meshCenter, explodeCenter)
          .normalize()
        // 爆炸距离 mesh中心点到爆炸中心点的距离
        value.userData.worldDistance = new THREE.Vector3().subVectors(meshCenter, explodeCenter)
        // 原始坐标
        value.userData.originPosition = value.getWorldPosition(new THREE.Vector3())
        // mesh中心点
        value.userData.meshCenter = meshCenter.clone()
        value.userData.explodeCenter = explodeCenter.clone()
      }
    })
  }
  /**
   * @description 模型爆炸
   * @param {THREE.Object3D} model 要爆炸的模型
   * @param {number} scalar 要爆炸的倍数，默认1即不爆炸，数字越大，散发越远
   */
  explodeModel(model: THREE.Object3D, scalar: number = 1) {
    if(!model) return
    if (!model.initExplode){
      this.initExplodeModel(model)
    }
    model.traverse(value => {
      if (!(value as THREE.Mesh).isMesh || !value.userData.originPosition) return
      const distance = value.userData.worldDir
        .clone()
        .multiplyScalar(value.userData.worldDistance.length() * scalar)
      const offset = new THREE.Vector3().subVectors(
        value.userData.meshCenter,
        value.userData.originPosition
      )
      const center = value.userData.explodeCenter
      const newPos = new THREE.Vector3().copy(center).add(distance).sub(offset)
      const localPosition = value.parent?.worldToLocal(newPos.clone())
      localPosition && value.position.copy(localPosition)
    })
    this.render()
  }
  /**
   * @description 显示模型切面
   * @param {number[][]} planes 要使用的辅助切面 
   * @param {boolean} showHelper 是否显示辅助切面
   */
  showProfile(planes: [number, number, number][],showHelper?: boolean) {
    const planeArr = planes.map((plane,index) => {
      const initPanel = new THREE.Plane(new THREE.Vector3(plane[0], plane[1], plane[2]), 0)
      initPanel.name = `profile${index}`
      return initPanel
    })
    this.renderer.clippingPlanes = planeArr
    this.renderer.localClippingEnabled = true
    planeArr.forEach(plane => {
      const helper = new THREE.PlaneHelper(plane, 500, 0xffff00)
      console.log('helper', helper)
      if (showHelper) {
        helper.name = `helper-${plane.name}`
        this.scene.add(helper)
      }
    })
    this.render()
  }
  /**
   * @description 隐藏模型切面
   */
  hideProfile() {
    this.renderer.clippingPlanes = []
    this.renderer.localClippingEnabled = false
    for(let i = this.scene.children.length - 1;i >= 0;i--){
      const child = this.scene.children[i]
      if (child.name.indexOf('profile') > -1) {
        this.scene.remove(child)
      }
    }
    this.render()
  }
  /**
  * 测试加载点云数量，主要用于性能测试
  * @param {number} count - 点云数量，默认为100000。
  */
  testLoadPointCloud(count = 100000) {
    const geometry = new THREE.BufferGeometry()
    // 设置顶点数组。每个粒子都是个三元组（x,y,z坐标）
    const particlePositions = new Float32Array(count * 3)
    for (let i = 1; i <= count * 3; i++) {
      // 范围：-50 到 50。这个可根据需求设置。
      particlePositions[i] = (Math.random() - 0.5) * 200
    }
    // 设置属性
    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const material = new THREE.PointsMaterial({
      size: 0.01
    })
    const mesh = new THREE.Points(geometry, material)
    // mesh.scale.set(0.00001, 0.00001, 0.00001)
    console.log('mesh', mesh)
    this.scene.add(mesh)
    this.render()
  }
  private hexToVec4(hex: string,alpha: number = 1) {
    // 移除 # 号并处理缩写（如 #fff → ffff）
    hex = hex.replace(/^#/, '')
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('')
    }

    // 解析 RGB 分量
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255

    // 返回 [R, G, B, A] 浮点数组
    return new THREE.Vector4(r, g, b, alpha)
  }
  private getPointsMaterial(pointSize: number,color?: string | AreaColor | LinearColor) {
    if (color && typeof color === 'object' && ('colorList' in color)) {
      console.log('area', color)
      return new THREE.ShaderMaterial({
        vertexColors: true,
        uniformsNeedUpdate: true,
        uniforms: {
          size: {
            value: pointSize
          },
          mins: { value: new Float32Array(color.colorList.map(c => c.min)) },  // 区间下限数组
          maxs: { value: new Float32Array(color.colorList.map(c => c.max)) },  // 区间上限数组
          colors: { value: color.colorList.map(c => this.hexToVec4(c.color)) }, // 颜色数组
          defaultColor: { value: this.hexToVec4(color.defaultColor ?? '#fff') }
        },
        vertexShader: `
          uniform float size;
          uniform vec4 defaultColor;
          uniform float mins[${color.colorList.length}];
          uniform float maxs[${color.colorList.length}];
          uniform vec4 colors[${color.colorList.length}];
          out vec4 frag_color;

          // 动态生成的区间判断逻辑
          vec4 getColorByValue(float value) {
            ${color.colorList.map((_, i) => `
              if (value >= mins[${i}] && value < maxs[${i}]) {
                return colors[${i}];
              }`).join(' else ')}
            return defaultColor;
          }

          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size;
            frag_color = getColorByValue(position.${color.valueType});
          }
        `,
        fragmentShader: `
          in vec4 frag_color;
          void main() {
            gl_FragColor = frag_color;
          }
        `
      })
    } else if (color && typeof color === 'object' && ('colors' in color)) {
      console.log('linear', color)
      return new THREE.ShaderMaterial({
        vertexColors: true,
        uniformsNeedUpdate: true,
        uniforms: {
          size: {
            value: pointSize
          },
          minValue: {
            value: color.minValue
          },
          maxValue: {
            value: color.maxValue
          },
          colors: {
            value: color.colors.map(item => this.hexToVec4(item))
          },
          stops: { value: color.positions }
        },
        vertexShader: `
          uniform float size;
          uniform float minValue;
          uniform float maxValue;
          uniform vec4 colors[${color.colors.length}];
          uniform float stops[${color.colors.length}];
          out vec4 frag_color;
          vec4 setColorByZ(float z_value){
            float t = clamp((z_value - minValue) / (maxValue - minValue), 0.0, 1.0);
            for (int i = 0; i < ${color.colors.length - 1}; i++) {
                if (t >= stops[i] && t <= stops[i+1]) {
                    float interval = stops[i+1] - stops[i];
                    float factor = (t - stops[i]) / interval;
                    return mix(colors[i], colors[i+1], factor);
                }
            }
            return colors[${color.colors.length - 1}];
          }
          void main(){
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size;
            frag_color = setColorByZ(position.${color.valueType});
          }
        `,

        fragmentShader: `
          in vec4 frag_color;
          void main(){
            gl_FragColor = frag_color;
          }
        `

      })
    }else {
      return new THREE.PointsMaterial({
        size: pointSize,
        color: color ?? '#fff'
      })
    }
  }
  /**
   * @description 加载点云
   * @param {Params} object
   * @param {number[]} object.data 点云数据，内容为number数组，每三个自动解析为x,y,z
   * @param {boolean} object.needCenter 是否需要居中
   * @param {number} object.pointSize 点云大小，默认为1
   * @param {string} object.color 点云颜色，有三种模式，分别是string（纯色） | AreaColor（根据数据大小显示颜色） | LinearColor（根据数据范围渐变）
   * @returns 
   */
  addPoints({ data,needCenter,pointSize = 1,color }:{data: number[],needCenter?: boolean,pointSize?: number,color?: string | AreaColor | LinearColor}): THREE.Mesh {
    const geometry = new THREE.BufferGeometry()
    // 设置顶点数组。每个粒子都是个三元组（x,y,z坐标）
    const particlePositions = new Float32Array(data)
    // 设置属性
    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const material = this.getPointsMaterial(pointSize, color)
    const mesh = new THREE.Points(geometry, material)
    console.log('mesh', mesh)
    if(needCenter){
      this.setMeshCenter(mesh)
    }
    this.scene.add(mesh)
    this.render()
    return mesh
  }
}

export default ThreeCore