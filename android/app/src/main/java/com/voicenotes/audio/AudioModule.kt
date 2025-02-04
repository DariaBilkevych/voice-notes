package com.voicenotes.audio

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class AudioModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val audioRecorder = AudioRecorder(reactContext)
    private val audioPlayer = AudioPlayer(reactContext)

    override fun getName(): String {
        return "AudioModule"
    }

    @ReactMethod
    fun startRecording(outputFileName: String, promise: Promise) {
        audioRecorder.startRecording(outputFileName, promise)
    }

    @ReactMethod
    fun pauseRecording(promise: Promise) {
        audioRecorder.pauseRecording(promise)
    }

    @ReactMethod
    fun resumeRecording(promise: Promise) {
        audioRecorder.resumeRecording(promise)
    }

    @ReactMethod
    fun stopRecording(promise: Promise) {
        audioRecorder.stopRecording(promise)
    }

    @ReactMethod
    fun getOutputFile(promise: Promise) {
        audioRecorder.getOutputFile(promise)
    }

    @ReactMethod
    fun getAmplitude(promise: Promise) {
        audioRecorder.getAmplitude(promise)
    }

    @ReactMethod
    fun startPlaying(filePath: String, promise: Promise) {
        audioPlayer.startPlaying(filePath, promise)
    }

    @ReactMethod
    fun pausePlaying(promise: Promise) {
        audioPlayer.pausePlaying(promise)
    }

    @ReactMethod
    fun resumePlaying(promise: Promise) {
        audioPlayer.resumePlaying(promise)
    }

    @ReactMethod
    fun isPlaying(promise: Promise){
        audioPlayer.isPlaying(promise)
    }

    @ReactMethod
    fun getDuration(promise: Promise) {
        audioPlayer.getDuration(promise)
    }

    @ReactMethod
    fun getCurrentPosition(promise: Promise) {
        audioPlayer.getCurrentPosition(promise)
    }

    @ReactMethod
    fun seekTo(position: Int, promise: Promise) {
        audioPlayer.seekTo(position, promise)
    }
}