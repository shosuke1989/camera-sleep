const canvas = document.getElementById( 'facecanvas' );
const videoEl = document.getElementById( 'video' );
const inputSize = 224;
const scoreThreshold = 0.5;
const options = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
let sleepcheck=document.getElementById( 'sleepcheck' );// 後で消す
let sleepcount=document.getElementById( 'sleepcount' );// 後で消す
let sleepaspect=document.getElementById( 'sleepaspect' );// 後で消す
let color=document.getElementById( 'color' );// 後で消す
let context;
context = canvas.getContext("2d");
context.fillRect(0, 0, canvas.width, canvas.height);
const soundOn = document.getElementById("soundOn");
let count;
count=0

//ここからはrangeの設定
//aspect
const aspect = document.getElementById('aspectrange'); // input要素
const currentValueElem = document.getElementById('aspectvalue'); // 埋め込む先のspan要素

// 現在の値をspanに埋め込む関数
const setCurrentValue = (val) => {
currentValueElem.innerText = val;
}

// inputイベント時に値をセットする関数
const rangeOnChange = (e) =>{
setCurrentValue(e.target.value);
}

//count
const time = document.getElementById('countrange'); // input要素
const currentValueElem2 = document.getElementById('countvalue'); // 埋め込む先のspan要素

// 現在の値をspanに埋め込む関数
const setCurrentValue2 = (val) => {
currentValueElem2.innerText = val;
}

// inputイベント時に値をセットする関数
const rangeOnChange2 = (e) =>{
setCurrentValue2(e.target.value);
}

window.onload = () => {
    time.addEventListener('input', rangeOnChange2); // スライダー変化時にイベントを発火
    setCurrentValue2(time.value); // ページ読み込み時に値をセット
    aspect.addEventListener('input', rangeOnChange); // スライダー変化時にイベントを発火
    setCurrentValue(aspect.value); // ページ読み込み時に値をセット
}
//rangeの設定終わり


//エンターキー無効
document.onkeypress = function(e) {
    // エンターキーだったら無効にする
    if (e.key === 'Enter') {
        return false;
    }
}

function sound(type, sec) {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    osc.type = type
    osc.connect(ctx.destination)
    osc.start()
    osc.stop(sec)
}

function sleep(){
    if(soundOn.checked==true){
        sound('sine', 0.5)
    }
    //メール送信設定
    const email=document.getElementById('email');

    if (email.value!=""){
        Email.send({
            SecureToken : "675a8e87-4d91-4512-a541-36668dbe915a",
            To : email.value,
            From : "camera.sleep.app@gmail.com",
            Subject : "Wake Up!",
            Body : "Wake Up!"
        }).then(
            message => alert(message)
          );
    };
    
    //メール送信設定終わり
}

async function onPlay(){
    if(videoEl.paused || videoEl.ended || !faceapi.nets.tinyFaceDetector.params)
        return setTimeout(() => onPlay())

    const result = await faceapi.detectSingleFace(videoEl, options).withFaceLandmarks()

    if (result) {
        const dims = faceapi.matchDimensions(canvas, videoEl, true)
        const resizedResult = faceapi.resizeResults(result, dims)
        const mrks = resizedResult.landmarks.positions
        faceapi.draw.drawFaceLandmarks(canvas, resizedResult)
        aspectcheck(mrks);
    }
    setTimeout(() => onPlay(),1000)
};

function aspectcheck(mrks){
    var a_l = Math.sqrt( Math.pow( mrks[37].x-mrks[41].x, 2 ) + Math.pow( mrks[37].y-mrks[41].y, 2 ) ) ;
    var b_l = Math.sqrt( Math.pow( mrks[38].x-mrks[40].x, 2 ) + Math.pow( mrks[38].y-mrks[40].y, 2 ) ) ;
    var c_l = Math.sqrt( Math.pow( mrks[36].x-mrks[39].x, 2 ) + Math.pow( mrks[36].y-mrks[39].y, 2 ) ) ;
    var EAR_L = ( a_l + b_l ) / ( 2 * c_l ) ;

    var a_r = Math.sqrt( Math.pow( mrks[43].x-mrks[47].x, 2 ) + Math.pow( mrks[43].y-mrks[47].y, 2 ) ) ;
    var b_r = Math.sqrt( Math.pow( mrks[44].x-mrks[46].x, 2 ) + Math.pow( mrks[44].y-mrks[46].y, 2 ) ) ;
    var c_r = Math.sqrt( Math.pow( mrks[42].x-mrks[45].x, 2 ) + Math.pow( mrks[42].y-mrks[45].y, 2 ) ) ;
    var EAR_R = ( a_r + b_r ) / ( 2 * c_r ) ;

    var EAR = ( EAR_R + EAR_L ) / 2;


    if(EAR<aspect.value){
        sleepaspect.textContent=String(Math.round(String(EAR)*1000)/1000)+" < "+String(aspect.value);// 後で消す
        sleepcheck.textContent="Close";// 後で消す
        color.className="close"
        count+=1
        sleepcount.textContent="："+String(count)+"秒";// 後で消す
        if(count>time.value){
            sleepcheck.textContent="Sleep";// 後で消す
            color.className="sleep"
            sleep()
            count=0
            sleepcount.textContent="";// 後で消す
        }
    }
    else{
        sleepaspect.textContent=String(Math.round(String(EAR)*1000)/1000)+" > "+String(aspect.value);// 後で消す

        sleepcheck.textContent="Awake";// 後で消す

        count=0
        sleepcount.textContent="";// 後で消す
        color.className="awake"
    }
}


async function run(){
    await faceapi.nets.tinyFaceDetector.load("models/")
    await faceapi.loadFaceLandmarkModel("models/")
const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
videoEl.srcObject = stream;
}

$(document).ready(function() {
    run();
});
    

