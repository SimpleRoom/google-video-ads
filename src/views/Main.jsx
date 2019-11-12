import React, { Component } from 'react'
import VideoAds from '../components/VideoAds/VideoAds'

import styles from './Main.module.scss'

export default class Main extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showBtn: true,
      playAds: false,
    }
    this.volume = 0.4
  }

  // 廣告開始播放時處理視頻為靜音
  adStart = () => {
    this.$video && (this.$video.muted = true)
    this.setState({
      playAds: true,
    })
  }

  // 廣告結束播放時恢復視頻音量
  adEnd = () => {
    if (!this.state.playAds) return
    this.setState({
      playAds: false,
    })
    if (this.$video) {
      try {
        this.$video.muted = false
        this.$video.volume = this.volume
        this.$video.loop = "loop"
        this.$video.play()
        console.log(`开始播放`)
      } catch (e) {
        console.log(e)
      }
    }
  }

  playVideo = () => {
    this.setState({ showBtn: false, playAds: true })
  }

  render() {
    const { showBtn, playAds } = this.state
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>视频播放之前播放谷歌广告</h3>
        <div className={styles.videoWrap}>
          <div className={styles.videoContent}>
            <video ref={$video => this.$video = $video} src="https://storage.googleapis.com/gvabox/media/samples/stock.mp4"></video>
            {
              showBtn ? (<button className={styles.playBtn} onClick={this.playVideo}>播放</button>) : null
            }
          </div>
          {playAds ? (
            <VideoAds
              style={{ opacity: playAds ? 1 : 0 }}
              className={styles.player}
              width={640}
              height={360}
              startPlay={this.adStart}
              endPlay={this.adEnd}
            />
          ) : null}
        </div>
      </div>
    )
  }
}
