customElements.define(
  'color-picker',
  class extends HTMLElement {
    constructor() {
      super()

      const shadowRoot = this.attachShadow({ mode: 'open' })

      shadowRoot.innerHTML = `
      <style>
        #color-picker {
          display: flex;
        }
        
        #color-picker-info {
          width: 150px;
          background-color: #4286f4;
          text-align: center;
        }
        
        #color-picker-info > input {
          background-color: transparent;
          outline: none;
          color: #FFFFFF;
          width: 80%;
          border: none;
          border-bottom: solid 1px rgba(255, 255, 255, 0.3);
          text-align: center;
          margin-top: 20px;
          font-weight: bold;
          font-size: 12px;
        }
        
        #color-picker-info > input:first-child {
          margin-top: 70px;
          font-size: 14px;
        }

        #color-picker > div > canvas:hover, #color-picker > div > div > div > canvas:hover {
          cursor: crosshair;
        }
        
        div.color-picker-position-secondary {
          text-align: center;
          padding: 17px;
          background-color: #F5F5F5;
          margin-top: -4px;
        }
        
        div.color-picker-position-secondary > div {
          margin: 0 auto;
        }
        
        #color-picker-position-block-secondary {
          margin-top: -3px;
          background: red;
        }
        
        div.color-picker-position-secondary > div > canvas {
          border-radius: 50px;
        }
        
        div.color-picker-position-primary {
          position: relative;
        }            
        
        div.color-picker-selector {
          height: 20px;
          width: 20px;          
          border-radius: 50px;
          background: transparent;
          border: solid 2px #FFFFFF;
          position: absolute;
          cursor: pointer;
        }
      </style>
      
      <div id="color-picker">
        <div id="color-picker-info">
          <input id="color-picker-hex" type="text" readonly>
          <input id="color-picker-rgb" type="text" readonly>
        </div>

        <div class="color-picker-position-primary">
          <div id="color-picker-position-block-primary" class="color-picker-selector"></div>            
            <canvas id="color-picker-canvas-block-primary" height="176" 
              width="${this.width - 150}"></canvas>

            <div class="color-picker-position-secondary">
              <div>
                <div id="color-picker-position-block-secondary" class="color-picker-selector"></div>
                <canvas id="color-picker-canvas-block-secondary" height="10" 
                  width="${this.width - 200}"></canvas>
                </div>
            </div>
        </div>
      </div>`

      if (this.hasAttribute('random-start')) {
        const round = Math.round
        const random = Math.random
        const rgb = [
          round(random() * 255),
          round(random() * 255),
          round(random() * 255)
        ]

        this.rgb = rgb.join(',')
      } else {
        if (this.hasAttribute('hexadecimal')) {
          const rgb = [
            +(this.hexadecimal.substring(0, 2), 16),
            +(this.hexadecimal.substring(2, 4), 16),
            +(this.hexadecimal.substring(4, 6), 16)
          ]

          this.rgb = rgb.join(',')
        }
      }

      this.generateColorInPrimaryBlock()
      this.generateColorInSecondaryBlock()

      if (this.hasAttribute('random-start')) {
        const randomXPrimaryBlock = Math.floor(
          Math.random() *
            this.canvasPrimaryBlock.getContext('2d').canvas.clientWidth
        )

        const randomYPrimaryBlock = Math.floor(
          Math.random() *
            this.canvasPrimaryBlock.getContext('2d').canvas.clientHeight
        )

        this.changeColor(randomXPrimaryBlock, randomYPrimaryBlock)

        const randomXSecondaryBlock = Math.floor(
          Math.random() *
            this.canvasSecondaryBlock.getContext('2d').canvas.clientWidth
        )

        const randomYSecondaryBlock = Math.floor(
          Math.random() *
            this.canvasSecondaryBlock.getContext('2d').canvas.clientHeight
        )

        this.clickedSecondaryBlock(randomXSecondaryBlock, randomYSecondaryBlock)
      }

      let isDragPrimaryBlock = false
      let isDragSecondaryBlock = false

      // Events
      this.canvasSecondaryBlock.addEventListener(
        'click',
        this.clickedSecondaryBlock,
        false
      )

      this.canvasSecondaryBlock.addEventListener(
        'mousedown',
        e => {
          isDragSecondaryBlock = true
          this.clickedSecondaryBlock(e.offsetX, 0)
        },
        false
      )

      this.canvasSecondaryBlock.addEventListener(
        'mouseup',
        () => {
          isDragSecondaryBlock = false
        },
        false
      )

      this.canvasSecondaryBlock.addEventListener(
        'mousemove',
        e => {
          if (isDragSecondaryBlock) {
            this.clickedSecondaryBlock(e.offsetX, e.offsetY)
          }
        },
        false
      )

      this.positionSecondaryBlock.addEventListener(
        'mousedown',
        e => {
          isDragSecondaryBlock = true
        },
        false
      )

      this.positionSecondaryBlock.addEventListener(
        'mouseup',
        () => {
          isDragSecondaryBlock = false
        },
        false
      )

      this.positionSecondaryBlock.addEventListener(
        'mousemove',
        e => {
          if (isDragSecondaryBlock) {
            const marginLeft = this.positionSecondaryBlock.style.marginLeft
              .length

            const axisX =
              +this.positionSecondaryBlock.style.marginLeft.substr(
                0,
                marginLeft - 2
              ) + e.offsetX

            this.clickedSecondaryBlock(axisX, 0)
          }
        },
        false
      )

      this.canvasPrimaryBlock.addEventListener(
        'mousedown',
        e => {
          isDragPrimaryBlock = true
          this.changeColor(e.offsetX, e.offsetY)
        },
        false
      )

      this.canvasPrimaryBlock.addEventListener(
        'mouseup',
        () => {
          isDragPrimaryBlock = false
        },
        false
      )

      this.canvasPrimaryBlock.addEventListener(
        'mousemove',
        e => {
          if (isDragPrimaryBlock) {
            this.changeColor(e.offsetX, e.offsetY)
          }
        },
        false
      )

      this.positionPrimaryBlock.addEventListener(
        'mousedown',
        () => {
          isDragPrimaryBlock = true
        },
        false
      )

      this.positionPrimaryBlock.addEventListener(
        'mouseup',
        () => {
          isDragPrimaryBlock = false
        },
        false
      )

      this.positionPrimaryBlock.addEventListener(
        'mousemove',
        e => {
          if (isDragPrimaryBlock) {
            const marginLeft = this.positionPrimaryBlock.style.marginLeft.length
            const marginTop = this.positionPrimaryBlock.style.marginTop.length

            const axisX =
              +this.positionPrimaryBlock.style.marginLeft.substr(
                0,
                marginLeft - 2
              ) + e.offsetX

            const axisY =
              +this.positionPrimaryBlock.style.marginTop.substr(
                0,
                marginTop - 2
              ) + e.offsetY

            this.changeColor(axisX, axisY)
          }
        },
        false
      )
    }

    get width() {
      return this.getAttribute('width') || 600
    }

    set rgb(rgb) {
      this.setAttribute('rgb', `rgb(${rgb})`)
    }

    get rgb() {
      return this.getAttribute('rgb') || 'rgb(0, 0, 0)'
    }

    set hexadecimal(hexadecimal) {
      this.setAttribute('hexadecimal', `#${hexadecimal}`)
    }

    get hexadecimal() {
      return this.getAttribute('hexadecimal') || '#000000'
    }

    get canvasPrimaryBlock() {
      return this.shadowRoot.getElementById('color-picker-canvas-block-primary')
    }

    get canvasSecondaryBlock() {
      return this.shadowRoot.getElementById(
        'color-picker-canvas-block-secondary'
      )
    }

    get positionPrimaryBlock() {
      return this.shadowRoot.getElementById(
        'color-picker-position-block-primary'
      )
    }

    get positionSecondaryBlock() {
      return this.shadowRoot.getElementById(
        'color-picker-position-block-secondary'
      )
    }

    generateColorInPrimaryBlock() {
      this.canvasPrimaryBlock
        .getContext('2d')
        .rect(
          0,
          0,
          this.canvasPrimaryBlock.width,
          this.canvasPrimaryBlock.height
        )

      this.canvasPrimaryBlock.getContext('2d').fillStyle = this.rgb
      this.canvasPrimaryBlock
        .getContext('2d')
        .fillRect(
          0,
          0,
          this.canvasPrimaryBlock.width,
          this.canvasPrimaryBlock.height
        )

      let white = this.canvasPrimaryBlock
        .getContext('2d')
        .createLinearGradient(0, 0, this.canvasPrimaryBlock.width, 0)

      white.addColorStop(0, 'rgba(255,255,255,1)')
      white.addColorStop(1, 'rgba(255,255,255,0)')

      this.canvasPrimaryBlock.getContext('2d').fillStyle = white
      this.canvasPrimaryBlock
        .getContext('2d')
        .fillRect(
          0,
          0,
          this.canvasPrimaryBlock.width,
          this.canvasPrimaryBlock.height
        )

      let black = this.canvasPrimaryBlock
        .getContext('2d')
        .createLinearGradient(0, 0, 0, this.canvasPrimaryBlock.height)

      black.addColorStop(0, 'rgba(0,0,0,0)')
      black.addColorStop(1, 'rgba(0,0,0,1)')

      this.canvasPrimaryBlock.getContext('2d').fillStyle = black

      this.canvasPrimaryBlock
        .getContext('2d')
        .fillRect(
          0,
          0,
          this.canvasPrimaryBlock.width,
          this.canvasPrimaryBlock.height
        )

      this.positionPrimaryBlock.style.backgroundColor = 'transparent'
    }

    generateColorInSecondaryBlock() {
      this.canvasSecondaryBlock
        .getContext('2d')
        .rect(
          0,
          0,
          this.canvasSecondaryBlock.width,
          this.canvasSecondaryBlock.height
        )

      let colorSecondaryBlock = this.canvasSecondaryBlock
        .getContext('2d')
        .createLinearGradient(0, 0, this.canvasSecondaryBlock.width, 0)

      colorSecondaryBlock.addColorStop(0, 'rgba(255, 0, 0, 1)')
      colorSecondaryBlock.addColorStop(0.17, 'rgba(255, 255, 0, 1)')
      colorSecondaryBlock.addColorStop(0.34, 'rgba(0, 255, 0, 1)')
      colorSecondaryBlock.addColorStop(0.51, 'rgba(0, 255, 255, 1)')
      colorSecondaryBlock.addColorStop(0.68, 'rgba(0, 0, 255, 1)')
      colorSecondaryBlock.addColorStop(0.85, 'rgba(255, 0, 255, 1)')
      colorSecondaryBlock.addColorStop(1, 'rgba(255, 0, 0, 1)')

      this.canvasSecondaryBlock.getContext('2d').fillStyle = colorSecondaryBlock
      this.canvasSecondaryBlock.getContext('2d').fill()
    }

    changeColor(x, y) {
      let axisY =
        y > this.canvasPrimaryBlock.getContext('2d').canvas.clientHeight
          ? this.canvasPrimaryBlock.getContext('2d').canvas.clientHeight
          : y

      axisY = axisY < 0 ? 0 : axisY

      let axisX =
        x > this.canvasPrimaryBlock.getContext('2d').canvas.clientWidth
          ? this.canvasPrimaryBlock.getContext('2d').canvas.clientWidth
          : x

      axisX = axisX < 0 ? 0 : axisX

      const imageData = this.canvasPrimaryBlock
        .getContext('2d')
        .getImageData(axisX, axisY, 1, 1).data

      this.rgb = `${imageData[0]},${imageData[1]},${imageData[2]}`

      this.shadowRoot.getElementById(
        'color-picker-info'
      ).style.backgroundColor = this.rgb

      this.positionPrimaryBlock.style.marginLeft = axisX - 10 + 'px'
      this.positionPrimaryBlock.style.marginTop = axisY - 10 + 'px'
      this.positionPrimaryBlock.style.backgroundColor = this.rgb

      const rgbReplaced = this.rgb.replace(/[^0-9\,]+/g, '').split(',')
      const colorCode =
        rgbReplaced[2] + 256 * rgbReplaced[1] + 65536 * rgbReplaced[0]

      const hexElement = this.shadowRoot.getElementById('color-picker-hex')
      const rgbElement = this.shadowRoot.getElementById('color-picker-rgb')

      hexElement.value = '#' + ('0000' + colorCode.toString(16)).substr(-6)
      rgbElement.value = this.rgb

      // Font color
      hexElement.style.borderBottomColor = 'rgba(255, 255, 255, 0.3)'
      hexElement.style.color = '#FFF'
      rgbElement.style.borderBottomColor = 'rgba(255, 255, 255, 0.3)'
      rgbElement.style.color = '#FFF'

      if (imageData[0] > 190 && imageData[1] > 190 && imageData[3] > 190) {
        hexElement.style.borderBottomColor = 'rgba(0, 0, 0, 0.3)'
        hexElement.style.color = '#000'
        rgbElement.style.borderBottomColor = 'rgba(0, 0, 0, 0.3)'
        rgbElement.style.color = '#000'
      }
    }

    clickedSecondaryBlock(x, y) {
      let axisX =
        x > this.canvasSecondaryBlock.getContext('2d').canvas.clientWidth
          ? this.canvasSecondaryBlock.getContext('2d').canvas.clientWidth
          : x

      axisX = axisX < 0 ? 0 : axisX

      const imageData = this.canvasSecondaryBlock
        .getContext('2d')
        .getImageData(axisX, y, 1, 1).data

      this.rgb = `${imageData[0]},${imageData[1]},${imageData[2]}`

      this.positionSecondaryBlock.style.marginLeft = axisX - 10 + 'px'
      this.positionSecondaryBlock.style.backgroundColor = this.rgb

      this.shadowRoot.getElementById(
        'color-picker-info'
      ).style.backgroundColor = this.rgb

      this.generateColorInPrimaryBlock()
    }
  }
)
