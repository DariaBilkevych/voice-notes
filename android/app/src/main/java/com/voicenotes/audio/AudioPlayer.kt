package com.voicenotes.audio

import android.media.MediaPlayer
import androidx.core.net.toUri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class AudioPlayer(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var player: MediaPlayer? = null
    private var currentPosition: Int = 0

    override fun getName(): String {
        return "AudioPlayer"
    }

    @ReactMethod
    fun startPlaying(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "The file does not exist at the specified path.")
                return
            }

            // Stop and release any previously playing instance
            player?.release()

            player = MediaPlayer.create(reactContext, file.toUri()).apply {
                setOnCompletionListener {
                    promise.resolve("Playback completed")
                }
                start()
            }
        } catch (e: Exception) {
            promise.reject("ERROR_PLAYING_FILE", "Failed to play the audio file.", e)
        }
    }

    @ReactMethod
    fun pausePlaying(promise: Promise) {
        try {
            player?.let {
                if (it.isPlaying) {
                    currentPosition = it.currentPosition
                    it.pause()
                    promise.resolve("Playback paused")
                } else {
                    promise.reject("NOT_PLAYING", "No audio is currently playing to pause.")
                }
            } ?: promise.reject("PLAYER_NOT_INITIALIZED", "Player has not been initialized.")
        } catch (e: Exception) {
            promise.reject("ERROR_PAUSING_FILE", "Failed to pause the audio file.", e)
        }
    }

    @ReactMethod
    fun resumePlaying(promise: Promise) {
        try {
            player?.let {
                it.seekTo(currentPosition)
                it.start()
                promise.resolve("Playback resumed")
            } ?: promise.reject("PLAYER_NOT_INITIALIZED", "Player has not been initialized.")
        } catch (e: Exception) {
            promise.reject("ERROR_RESUMING_FILE", "Failed to resume the audio file.", e)
        }
    }

    @ReactMethod
    fun getDuration(promise: Promise) {
        try {
            player?.let {
                val duration = it.duration
                promise.resolve(duration)
            } ?: promise.reject("PLAYER_NOT_INITIALIZED", "Player has not been initialized.")
        } catch (e: Exception) {
            promise.reject("ERROR_GETTING_DURATION", "Failed to get audio duration.", e)
        }
    }

    @ReactMethod
    fun getCurrentPosition(promise: Promise) {
        try {
            player?.let {
                val currentPosition = it.currentPosition
                promise.resolve(currentPosition)
            } ?: promise.reject("PLAYER_NOT_INITIALIZED", "Player has not been initialized.")
        } catch (e: Exception) {
            promise.reject("ERROR_GETTING_CURRENT_POSITION", "Failed to get current position.", e)
        }
    }

    @ReactMethod
    fun seekTo(position: Int, promise: Promise) {
        try {
            player?.let {
                it.seekTo(position)
                promise.resolve("Seeked to position: $position")
            } ?: promise.reject("PLAYER_NOT_INITIALIZED", "Player has not been initialized.")
        } catch (e: Exception) {
            promise.reject("ERROR_SEEKING", "Failed to seek audio.", e)
        }
    }
}