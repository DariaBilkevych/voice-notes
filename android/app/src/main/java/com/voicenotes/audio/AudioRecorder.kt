package com.voicenotes.audio

import android.media.MediaRecorder
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File

class AudioRecorder(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var recorder: MediaRecorder? = null
    private var outputFile: String? = null


    override fun getName(): String {
        return "AudioRecorder"
    }

    private fun createRecorder(): MediaRecorder {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            MediaRecorder(reactContext.applicationContext)
        } else {
            MediaRecorder()
        }
    }

    @ReactMethod
    fun startRecording(outputFileName: String, promise: Promise) {
        try {
            // Creating a source file
            val outputDir = reactContext.cacheDir // Temporary directory
            val outputFile = File(outputDir, "$outputFileName.m4a")
            this.outputFile = outputFile.absolutePath

            // Configure MediaRecorder
            recorder = createRecorder().apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setOutputFile(outputFile.absolutePath)

                prepare()
                start()
            }

            promise.resolve("Recording started, output: ${outputFile.absolutePath}")
        } catch (e: Exception) {
            promise.reject("ERROR_STARTING_RECORDING", "Failed to start recording", e)
        }
    }

    @ReactMethod
    fun pauseRecording(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                recorder?.pause()
                promise.resolve("Recording paused")
            } else {
                promise.reject("ERROR_PAUSE", "Pause not supported on this device")
            }
        } catch (e: Exception) {
            promise.reject("ERROR_PAUSE", "Failed to pause recording", e)
        }
    }

    @ReactMethod
    fun resumeRecording(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                recorder?.resume()
                promise.resolve("Recording resumed")
            } else {
                promise.reject("ERROR_RESUME", "Resume not supported on this device")
            }
        } catch (e: Exception) {
            promise.reject("ERROR_RESUME", "Failed to resume recording", e)
        }
    }

    @ReactMethod
    fun stopRecording(promise: Promise) {
        try {
            recorder?.apply {
                stop()
                reset()
                release()
            }
            recorder = null

            promise.resolve("Recording stopped, file saved at: $outputFile")
        } catch (e: Exception) {
            recorder = null
            promise.reject("ERROR_STOPPING_RECORDING", "Failed to stop recording", e)
        }
    }

    @ReactMethod
    fun getOutputFile(promise: Promise) {
        if (outputFile != null) {
            promise.resolve(outputFile)
        } else {
            promise.reject("NO_FILE", "No recording file available")
        }
    }
}