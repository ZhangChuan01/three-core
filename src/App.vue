<script setup lang='ts'>
import axios from 'axios'
import ThreeCore from './index'

let threeCore:ThreeCore
let redBar
const testLoadFbx = async () => {
  // threeCore.changeCameraPosition({ z: 10 })
  resetScene()
  threeCore.changeCameraPosition({
    position: {
      x: -2.27,
      y: 2.9,
      z: 6.41
    },
    up: {
      x: 0,
      y: 1,
      z: 0
    }
  })
  redBar = await threeCore.loadFbx({
    url: './CoiledBar_RedL.fbx',
    addToScene: false,
    needCache: true
  })
  const cloneBar = redBar.clone()
  cloneBar.name = 'cloneBar'
  threeCore.addMesh(cloneBar)
  threeCore.render()
  setTimeout(() => {
    threeCore.moveMeshAnimate({
      name: 'cloneBar',
      x: 2
    })
  }, 1000)
  setTimeout(() => {
    threeCore.removeMesh('cloneBar')
    threeCore.render()
  },3000)
}
let motorcycle
const testLoadObj = async () => {
  // threeCore.changeCameraPosition({ z: 400 })
  resetScene()
  threeCore.changeCameraPosition({
    position: {
      x: -344.25,
      y: 53.12,
      z: 194.60
    },
    up: {
      x: 0,
      y: 1,
      z: 0
    }
  })
  motorcycle = await threeCore.loadObj({
    url: './motorcycle.obj',
    addToScene: true,
    needCache: true,
    needCenter: true,
    name: 'motorcycle'
  })
  // console.log('motorcycle', motorcycle)
  console.log(threeCore.getMeshSize(motorcycle))
  setTimeout(() => {
    threeCore.explodeModel(motorcycle,2)
  }, 2000)
  setTimeout(() => {
    threeCore.showProfile([ [ 1,0,0 ],[ 0,1,0 ] ],true)
  }, 4000)
  setTimeout(() => {
    threeCore.hideProfile()
  }, 6000)
  setTimeout(() => {
    threeCore.explodeModel(motorcycle)
  }, 8000)
  setTimeout(() => {
    threeCore.removeMesh('motorcycle')
    threeCore.render()
  }, 9000)
}
const generatePoints = () => {
  const points: number[] = []
  for (let i = 0; i < 100000; i++) {
    const x = Math.floor(Math.random() * 100)
    const y = Math.floor(Math.random() * 100)
    const z = Math.floor(Math.random() * 200) - 100
    points.push( x, y, z )
  }
  console.log('points', points)
  return points
}
let pointClound
const testPointClound = (type?: string) => {
  // axios.get('./2023-02-02-19-00.csv',{
  //   responseType: 'blob'
  // }).then(res => {
  //   if(res.data instanceof Blob){
  //     const fileReader = new FileReader()
  //     fileReader.readAsText(res.data)
  //     fileReader.onload = () => {
  //       console.log(fileReader.result)
  //       const pointsData = (fileReader.result as string)?.replace(/\n/g, ',').split(',').slice(3,-1).map(item => Number(item) / 1000)
  //       console.log('pointsData', pointsData)
  //       const pointClound = threeCore.addPoints({
  //         data: pointsData,
  //         needCenter: true
  //       })
  //       // pointClound.translateX(10.5)
  //       // threeCore.render()
  //     }
  //   }
  // })
  // threeCore.changeCameraPosition({
  //   x: 2.56,
  //   y: -398.85,
  //   z: -2.16
  // })
  resetScene()
  threeCore.changeCameraPosition({
    position: {
      x: 4.72,
      y: -398.86,
      z: 9.45
    },
    up: {
      x: 0,
      y: 0,
      z: 1
    }
  })
  pointClound = threeCore.addPoints({
    data: generatePoints(),
    needCenter: true,
    color: type === 'area' ? {
      colorList: [
        {
          min: -100,
          max: -20,
          color: '#10F920'
        },
        {
          min: -20,
          max: 50,
          color: '#F9BB10'
        },
        {
          min: 50,
          max: 80,
          color: '#FD2121'
        }
      ],
      valueType: 'z',
      defaultColor: '#0B7EF5'
    } : type === 'linear' ? {
      colors: [ '#10F920','#F9BB10','#FD2121' ],
      positions: [ 0,0.3,1 ],
      minValue: -100,
      maxValue: 100,
      valueType: 'z'
    } : '#ED0707'
  })
}
const initThree = () => {
  threeCore = new ThreeCore({
    container: document.getElementById('container') as HTMLElement,
    backgroundImage: './three-bg.png',
    // skyBox: './Cold Sunset Equirect.png',
    lightIntensity: 3,
    z: 10
    // x: 100
    // backgroundColor: 'red'
  })
  threeCore.createScene()
  // threeCore.createPanel({ direction: 'vertical' })
  // threeCore.testLoadPointCloud()
  threeCore.render()
}
const resetScene = () => {
  if(pointClound) threeCore.removeMesh(pointClound)
  if(motorcycle) threeCore.removeMesh(motorcycle)
  if(redBar) threeCore.removeMesh(redBar)
}
onMounted(() => {
  initThree()
})
</script>

<template>
  <div class="btn-wrapper">
    <button @click="testLoadFbx">
      测试 FBX
    </button>
    <button @click="testLoadObj">
      测试 OBJ及爆炸图
    </button>
    <button @click="testPointClound()">
      测试点云普通色
    </button>
    <button @click="testPointClound('area')">
      测试点云分割色
    </button>
    <button @click="testPointClound('linear')">
      测试点云渐变色
    </button>
  </div>
  <div id="container" />
</template>
<style lang="scss" scoped>
#container {
  width: 100%;
  height: 100vh;
}
.btn-wrapper {
  position: absolute;
  top: 10px;
  left: 10px;
  button {
    margin-right: 15px;
    cursor: pointer;
  }
}
</style>
