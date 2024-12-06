import React from 'react';
import {Provider} from 'react-redux';
import store from './src/store';
import {SafeAreaView, View} from 'react-native';
import RecordingPanel from './src/components/RecordingPanel';
import RecordingList from './src/components/RecordingList';

const App = (): React.JSX.Element => {
  return (
    <Provider store={store}>
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          <RecordingList />
          <RecordingPanel />
        </View>
      </SafeAreaView>
    </Provider>
  );
};

export default App;
