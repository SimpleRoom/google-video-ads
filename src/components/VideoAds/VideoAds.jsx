import React, { Component } from 'react'
import PropTypes from 'prop-types'

import styles from './VideoAds.module.scss'

class VideoAds extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hided: true,
    }
  }

  shouldComponentUpdate(nextProps) {
    if ((nextProps.width !== this.props.width || nextProps.height !== this.props.height) && this.adsManager) {
      const { google } = window
      this.adsManager.resize(this.$adContainer.offsetWidth, this.$adContainer.offsetHeight, google.ima.ViewMode.NORMAL)
    }
    return true
  }

  componentDidMount() {
    const { width, height } = this.props
    if (window.google && window.google.ima) {
      this.initGoogleAds({ width, height })
    } else {
      this.insertGoogleAds({ width, height })
    }
  }

  insertGoogleAds = (props) => {
    const self = this
    const gads = document.createElement('script')
    gads.async = true
    gads.type = 'text/javascript'
    const useSSL = document.location.protocol === 'https:'

    gads.onload = function () {
      self.initGoogleAds(props)
    }
    gads.src = `${useSSL ? 'https:' : 'http:'}//imasdk.googleapis.com/js/sdkloader/ima3.js`
    const node = document.getElementsByTagName('script')[0]
    node.parentNode.insertBefore(gads, node)
  }

  onAdsManagerLoaded = (adsManagerLoadedEvent) => {
    const { $video } = this
    const { google } = window
    const adsRenderingSettings = new google.ima.AdsRenderingSettings()
    adsRenderingSettings.uiElements = [google.ima.UiElements.COUNTDOWN, google.ima.UiElements.AD_ATTRIBUTION]

    // Get the ads manager.
    // See API reference for contentPlayback
    const adsManager = adsManagerLoadedEvent.getAdsManager($video, adsRenderingSettings)

    // Add listeners to the required events.
    adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, this.onAdStart)
    adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onAdError)
    adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this.onContentPauseRequested)
    adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, this.onAdPlayCompleted)

    this.adsManager = adsManager

    try {
      // Initialize the ads manager. Ad rules playlist will start at this time.
      adsManager.init(this.$adContainer.offsetWidth, this.$adContainer.offsetHeight, google.ima.ViewMode.NORMAL)
      // Call start to show ads. Single video and overlay ads will
      // start at this time; this call will be ignored for ad rules, as ad rules
      // ads start when the adsManager is initialized.
      adsManager.start()
    } catch (adError) {
      // An error may be thrown if there was a problem with the VAST response.
      // Play content here, because we won't be getting an ad.
      // hide the ad block
      this.setState({ hided: true })
    }
  }

  onAdStart = () => {
    const { startPlay } = this.props
    startPlay && startPlay()
    this.setState({ hided: false })
  }

  onAdError = (adErrorEvent) => {
    console.log('endAd')
    const { adsManager } = this
    const { endPlay } = this.props
    console.log(adErrorEvent.getError())
    // Handle the error logging and destroy the AdsManager
    adsManager && adsManager.destroy()

    this.setState({ hided: true })
    endPlay && endPlay()
  }

  onContentPauseRequested = () => {
    // This function is where you should setup UI for showing ads (e.g.
    // display ad timer countdown, disable seeking, etc.)
  }

  onAdPlayCompleted = () => {
    const { adsLoader } = this
    const { endPlay } = this.props
    this.setState({ hided: true })

    adsLoader.contentComplete()
    endPlay && endPlay()
  }

  initGoogleAds = () => {
    const { google } = window
    google.ima.settings.setPlayerVersion('1.0.0');
    // Set locale. This must be done before
    // AdDisplayContainer and AdsLoader have
    // been initialized.
    google.ima.settings.setLocale('zh_cn');
    const { $adContent, $video } = this
    // control the volume of google video
    $video.volume = 0.6
    const adDisplayContainer = new google.ima.AdDisplayContainer($adContent, $video)
    // Must be done as the result of a user action on mobile
    adDisplayContainer.initialize()
    // Re-use this AdsLoader instance for the entire lifecycle of your page.
    const adsLoader = new google.ima.AdsLoader(adDisplayContainer)
    this.adsLoader = adsLoader
    // Add event listeners
    adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this.onAdsManagerLoaded, false)
    adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onAdError, false)

    const adsRequest = this.craeteAdRequest()
    // request vidoe ads
    adsLoader.requestAds(adsRequest)
  }

  craeteAdRequest = () => {
    const { google } = window
    const adsRequest = new google.ima.AdsRequest()

    /* eslint-disable max-len */
    /** 可以关闭的 */
    adsRequest.adTagUrl =
      'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&' +
      'iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&' +
      'gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=' +
      'deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator=';

    // adsRequest.adTagUrl =
    //   'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&' +
    //   'iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&' +
    //   'gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=' +
    //   'deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

    /*** */
    // adsRequest.adTagUrl =
    //   'http://pubads.g.doubleclick.net/gampad/ads?sz=400x300&' +
    //   'iu=%2F6062%2Fiab_vast_samples&ciu_szs=300x250%2C728x90&gdfp_req=1&' +
    //   'env=vp&output=vast&unviewed_position_start=1&url=' +
    //   '[referrer_url]&correlator=[timestamp]&cust_params=iab_vast_samples' +
    //   '%3Dlinear';

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    adsRequest.linearAdSlotWidth = 1920
    adsRequest.linearAdSlotHeight = 1090
    adsRequest.nonLinearAdSlotWidth = 1920
    adsRequest.nonLinearAdSlotHeight = 1080

    return adsRequest
  }

  render() {
    const { hided } = this.state
    return (
      <section
        className={`${styles.adWrap} ${hided ? styles.hided : ''}`}
        ref={$adContainer => (this.$adContainer = $adContainer)}
      >
        <video className={styles.adVideo} ref={$video => (this.$video = $video)} />
        <div ref={$adContent => (this.$adContent = $adContent)} />
      </section>
    )
  }
}

VideoAds.propTypes = {
  startPlay: PropTypes.func.isRequired,
  endPlay: PropTypes.func.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
}

VideoAds.defaultProps = {}

export default VideoAds
