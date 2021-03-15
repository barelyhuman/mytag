
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

// import * as mobilenet from '@tensorflow-models/mobilenet'
// see https://github.com/tensorflow/tfjs-models
import * as cocossd from '@tensorflow-models/coco-ssd'

import * as jpeg from 'jpeg-js'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system';


class CocoSsdScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isTfReady: false,
        isModelReady: false,
        predictions: null,
        image: null,
        imgWidth: null,
        imgHeight: null
      };
  
    }
  
    async componentDidMount() {
      await tf.ready(); // preparing TensorFlow
      this.setState({ isTfReady: true,});
  
      // this.model = await mobilenet.load(); // preparing MobileNet model
      this.model = await cocossd.load(); // preparing COCO-SSD model
      this.setState({ isModelReady: true });
  
      this.getPermissionAsync(); // get permission for accessing camera on mobile device
    }
  
    getPermissionAsync = async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      // if (Constants.platform.ios) {
      //     const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      //     if (status !== 'granted') {
      //         alert('Please grant camera roll permission for this project!')
      //     }
      // }
    }
  
    imageToTensor(rawImageData) {
      const TO_UINT8ARRAY = true
      const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
      // Drop the alpha channel info for mobilenet
      const buffer = new Uint8Array(width * height * 3)
      let offset = 0 // offset into original data
      for (let i = 0; i < buffer.length; i += 3) {
        buffer[i] = data[offset]
        buffer[i + 1] = data[offset + 1]
        buffer[i + 2] = data[offset + 2]
  
        offset += 4
      }
  
      this.setState( {imgWidth: width, imgHeight: height} )
  
      return tf.tensor3d(buffer, [height, width, 3])
    }
  
    detectObjects = async () => {
      try {
        // const image = require('./assets/icon.png');
        const imageAssetPath = Image.resolveAssetSource(this.state.image);
        console.log(imageAssetPath);
  
        // const response = await fetch(imageAssetPath.uri, {}, { isBinary: true })// fetch(imageAssetPath.uri, {}, { isBinary: true })
        // const rawImageData = await response.arrayBuffer();
  
        const imgB64 = await FileSystem.readAsStringAsync(imageAssetPath.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
        const raw = new Uint8Array(imgBuffer)  
        
        const imageTensor = this.imageToTensor(raw)
        const predictions = await this.model.detect(imageTensor)
  
        this.setState({ predictions: predictions })
        // this.setState({ image_uri: imageAssetPath.uri })
  
        console.log('----------- predictions: ', predictions);
  
      } catch (error) {
        console.log('Exception Error: ', error)
      }
    }
    
  
    selectImage = async () => {
      try {
        let response = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [1, 1]
        })
  
        if (!response.cancelled) {
          const source = { uri: response.uri }
          this.setState({ image: source })
          this.detectObjects()
        }
      } catch (error) {
        console.log(error)
      }
    }
  
    /*
    [{
    bbox: [x, y, width, height],
    class: "person",
    score: 0.8380282521247864
    }, {
    bbox: [x, y, width, height],
    class: "kite",
    score: 0.74644153267145157
    }]
    */
    renderPrediction = (prediction, index) => {
      const pclass = prediction.class;
      const score  = prediction.score;
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const w = prediction.bbox[2];
      const h = prediction.bbox[3];
  
      return (
        <View style={styles.welcomeContainer}>
          <Text style={styles.text}>
            Prediction: {pclass} {', '} Probability: {score} {', '} Bbox: {x} {', '} {y} {', '} {w} {', '} {h} 
          </Text>
        </View>
      )
    }
  
    render() {
      const { isTfReady, isModelReady, predictions, image, imgWidth, imgHeight } = this.state;
  
      let tp, lf, wd, hg;
  
      if (predictions && predictions[0]) {
        console.log("img width & height: ", imgWidth, imgHeight);
        lf = predictions[0].bbox[0] / imgWidth * 250;
        tp = predictions[0].bbox[1] / imgHeight * 250;
        wd = predictions[0].bbox[2] / imgWidth * 250;
        hg = predictions[0].bbox[3] / imgHeight * 250;
      }
  
      return (
        <View style={styles.container}>
  
          <View style={styles.welcomeContainer}>
  
          <StatusBar barStyle='light-content' />
          <View style={styles.loadingContainer}>
            <Text style={styles.text}>
              TensorFlow.js ready? {isTfReady ? <Text>✅</Text> : ''}
            </Text>
  
            <View style={styles.loadingModelContainer}>
              <Text style={styles.text}>COCO-SSD model ready? </Text>
              {isModelReady ? (
                <Text style={styles.text}>✅</Text>
              ) : (
                <ActivityIndicator size='small' />
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={isModelReady ? this.selectImage : undefined}>
  
            {isModelReady && predictions &&
              predictions[0] &&
              // <View style={styles.imageContainer}>
              // <View style={styles.rectangle}></View>
              <ImageBackground source={image} resizeMode='stretch' style={styles.imageContainer}>
              <View style={[
                styles.rectangle,
                {
                  top: tp,//predictions[0].bbox[0],
                  left: lf,// predictions[0].bbox[1]
                  width: wd,//predictions[0].bbox[2],
                  height: hg, //predictions[0].bbox[3],
                }
              ]}></View>
              </ImageBackground>}
            {image && !predictions && <Image source={image} style={styles.imageContainer} />}
  
            {isModelReady && !image && (
              <Text style={styles.transparentText}>Tap to choose image</Text>
            )}
          </TouchableOpacity>
          <View style={styles.predictionWrapper}>
            {isModelReady && image && (
              <Text style={styles.text}>
                Predictions: {predictions ? '' : 'Detecting...'}
              </Text>
            )}
  
            {isModelReady &&
              predictions &&
              predictions.map((p, index) => this.renderPrediction(p, index))}
          </View>
          
          </View>
        </View>
      )
    }
  }
  
  

//   welcomeContainer: {
//     alignItems: 'center',
//     marginTop: 10,
//     marginBottom: 20,
//   },
//   welcomeImage: {
//     width: 100,
//     height: 80,
//     resizeMode: 'contain',
//     marginTop: 3,
//     marginLeft: -10,
//   },
//   contentContainer: {
//     paddingTop: 30,
//   },
//   loadingContainer: {
//     marginTop: 80,
//     justifyContent: 'center'
//   },
//   rectangle: {
//     height: 128,
//     width: 128,
//     borderColor: 'blue',
//     borderWidth: 5,
//     borderStyle: 'dashed',
//     position: 'relative', 
//     top: '0%',
//     left: '0%'
//   },
//   text: {
//     color: '#ffffff',
//     fontSize: 16
//   },
//   loadingModelContainer: {
//     flexDirection: 'row',
//     marginTop: 10
//   },
//   imageWrapper: {
//     width: 280,
//     height: 280,
//     padding: 10,
//     borderColor: '#cf667f',
//     borderWidth: 5,
//     borderStyle: 'dashed',
//     marginTop: 40,
//     marginBottom: 10,
//     position: 'relative',
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   imageContainer: {
//     width: 250,
//     height: 250,
//     position: 'absolute',
//     top: 10,
//     left: 10,
//     bottom: 10,
//     right: 10
//   },
//   predictionWrapper: {
//     height: 100,
//     width: '100%',
//     flexDirection: 'column',
//     alignItems: 'center'
//   },
//   transparentText: {
//     color: '#ffffff',
//     opacity: 0.7
//   },
//   footer: {
//     marginTop: 40
//   },
//   poweredBy: {
//     fontSize: 20,
//     color: '#e69e34',
//     marginBottom: 6
//   },
//   tfLogo: {
//     width: 125,
//     height: 70
//   }