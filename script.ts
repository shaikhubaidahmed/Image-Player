interface ToolFunctions {
  upload: () => void;
  save: () => void;
  flipHor: () => void;
  flipVert: () => void;
  rotateL: () => void;
  rotateR: () => void;
  resize: () => void;
  greyscale: () => void;
}
interface Editor {
  width: number;
  height: number;
}

interface RGBPixel {
  0: number;
  1: number;
  2: number;
}

type RGBArray = RGBPixel[][];

type ImageData = (RGBPixel[] | number)[];

type InputPrompt = string | null;

const onload = (): void => {
  const editor: HTMLCanvasElement = document.getElementById(
    "editor"
  ) as HTMLCanvasElement;
  const context: CanvasRenderingContext2D = editor.getContext(
    "2d"
  ) as CanvasRenderingContext2D;
  const toolbar: HTMLElement = document.getElementById(
    "toolbar"
  ) as HTMLElement;

  const tools: ToolFunctions = {
    upload: function (): void {
      const upload: HTMLInputElement = document.createElement(
        "input"
      ) as HTMLInputElement;
      upload.type = "file";
      upload.click();
      upload.onchange = function (): void {
        const img: HTMLImageElement = new Image();
        img.onload = () => {
          editor.width = img.width;
          editor.height = img.height;
          context.drawImage(img, 0, 0);
        };
        img.onerror = () => {
          console.error(
            "The provided file couldn't be loaded as an Image media"
          );
        };

        img.src = URL.createObjectURL(this.files[0]);
      };
    },
    save: function (): void {
      const image: string = editor.toDataURL();
      const link: HTMLAnchorElement = document.createElement(
        "a"
      ) as HTMLAnchorElement;
      link.download = "image.png";
      link.href = image;
      link.click();
    },
    flipHor: function (): void {
      let cols: number = editor.width; // Width is number of columns
      let rows: number = editor.height; // Height is number of rows
      let image: number[][] = getRGBArray(rows, cols);

      for (let i: number = 0; i < Math.floor(rows / 2); i++) {
        for (let j: number = 0; j < cols; j++) {
          let tmp: number[] = image[i][j];
          image[i][j] = image[rows - 1 - i][j];
          image[rows - 1 - i][j] = tmp;
        }
      }
      setImageData(image, rows, cols);
    },
    flipVert: function (): void {
      let cols: number = editor.width; // Width is number of columns
      let rows: number = editor.height; // Height is number of rows
      let image: number[][] = getRGBArray(rows, cols);

      for (let i: number = 0; i < rows; i++) {
        for (let j: number = 0; j < Math.floor(cols / 2); j++) {
          let tmp: number[] = image[i][j];
          image[i][j] = image[i][cols - 1 - j];
          image[i][cols - 1 - j] = tmp;
        }
      }
      setImageData(image, rows, cols);
    },
    rotateL = (): void => {
      let cols: number = editor.width; // Width is number of columns
      let rows: number = editor.height; // Height is number of rows
      let image: RGBArray = getRGBArray(rows, cols);

      let limage: RGBArray = [];
      for (let i: number = cols - 1; i >= 0; i--) {
        let row: RGBPixel[] = [];
        for (let j: number = 0; j < rows; j++) {
          row.push(image[j][i]);
        }
        limage.push(row);
      }
      setImageData(limage, cols, rows);
    },
    rotateR = (): void => {
      let cols: number = editor.width; // Width is number of columns
      let rows: number = editor.height; // Height is number of rows
      let image: RGBArray = getRGBArray(rows, cols);

      let rimage: RGBArray = [];
      for (let i: number = 0; i < cols; i++) {
        let row: RGBPixel[] = [];
        for (let j: number = rows - 1; j >= 0; j--) {
          row.push(image[j][i]);
        }
        rimage.push(row);
      }
      setImageData(rimage, cols, rows);
    },
    resize = (): void => {
      let cols: number = editor.width; // Width is number of columns
      let rows: number = editor.height; // Height is number of rows
      let image: RGBArray = getRGBArray(rows, cols);

      let inp: InputPrompt = prompt(
        "Current Width : " +
          cols +
          "\n" +
          "Current Height : " +
          rows +
          "\n" +
          "Give the new width and height in a space separated manner"
      );
      if (inp === null) {
        return;
      }
      const inputValues: string[] = inp.split(" ");
      if (inputValues.length !== 2) {
        alert("Incorrect dimensions in input");
        return;
      }
      let ncols: number = parseInt(inputValues[0]);
      let nrows: number = parseInt(inputValues[1]);
      if (isNaN(ncols) || isNaN(nrows)) {
        alert("Input is not a proper number");
        return;
      }

      let hratio: number = rows / nrows;
      let wratio: number = cols / ncols;

      let nimage: RGBArray = [];
      for (let i: number = 0; i < nrows; i++) {
        let row: RGBPixel[] = [];
        for (let j: number = 0; j < ncols; j++) {
          row.push(image[Math.floor(i * hratio)][Math.floor(j * wratio)]);
        }
        nimage.push(row);
      }
      setImageData(nimage, nrows, ncols);
    },
    greyscale = (): void => {
      const cols: number = editor.width; // Width is number of columns
      const rows: number = editor.height; // Height is number of rows
      const image: number[][][] = getRGBArray(rows, cols);

      for (let i: number = 0; i < rows; i++) {
        for (let j: number = 0; j < cols; j++) {
          const pixel: number[] = image[i][j];
          const shade: number = Math.floor(
            0.3 * pixel[0] + 0.59 * pixel[1] + 0.11 * pixel[2]
          );
          image[i][j][0] = image[i][j][1] = image[i][j][2] = shade;
        }
      }
      setImageData(image, rows, cols);
    },
  };
  for (let button of toolbar.children) {
    if (button.nodeName === "BUTTON") {
      button.onclick = function (event: MouseEvent) {
        event.preventDefault();
        tools[this.id].call(this);
      };
    }
  }

  function setImageData(data: number[][][], rows: number, cols: number) {
    const Image: number[] = Array.from({ length: rows * cols * 4 });
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        for (let k = 0; k < 4; k++) {
          Image[(i * cols + j) * 4 + k] = data[i][j][k];
        }
      }
    }
    const idata = context.createImageData(cols, rows);
    idata.data.set(Image);
    editor.width = cols;
    editor.height = rows;
    context.putImageData(idata, 0, 0);
  }

  function getRGBArray(rows: number, cols: number): number[][][] {
    let data: Uint8ClampedArray = context.getImageData(0, 0, cols, rows).data;
    const RGBImage: number[][][] = [];
    for (let i = 0; i < rows; i++) {
      let row: number[][] = [];
      for (let j = 0; j < cols; j++) {
        let pixel: number[] = [];
        for (let k = 0; k < 4; k++) {
          pixel.push(data[(i * cols + j) * 4 + k]);
        }
        row.push(pixel);
      }
      RGBImage.push(row);
    }
    return RGBImage;
  }
};
