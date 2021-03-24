import React, { useEffect, useState } from 'react'
import { ImageBackground, View, StyleSheet } from 'react-native'

export default function DetectedImage ({ img, predictions }) {
  const [boxes, setBoxes] = useState([])
  // const image = useRef(null);

  useEffect(() => {
    if (!predictions) return
    const newBoxes = []
    for (const pred of predictions) {
      const box = {}
      box.left = pred.bbox[0] /// image.current.offsetWidth * 250;
      box.top = pred.bbox[1] /// image.current.offsetWidth * 250;
      box.width = pred.bbox[2] /// image.current.offsetWidth * 250;
      box.height = pred.bbox[3] /// image.current.offsetWidth * 250;
      newBoxes.push(box)
    }

    setBoxes(newBoxes)
  }, [predictions])

  return (
    <ImageBackground
      source={{ uri: img }}
      resizeMode="contain"
      style={{ flex: 1 }}
    >
      {boxes.map((box) => (
        <View style={[styles.rectangle, box]} key={box.top + box.left}></View>
      ))}
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  rectangle: {
    height: 128,
    width: 128,
    borderColor: 'aquamarine',
    borderWidth: 5,
    position: 'absolute',
    top: '0%',
    left: '0%'
  }
})
