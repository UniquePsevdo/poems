'use strict';

// Verses controller
angular.module('verses').controller('VersesController', ['$window', '$timeout', '$scope', '$stateParams', '$location',
	'Authentication', 'Verses', 'Socket',
	function($window, $timeout, $scope, $stateParams, $location, Authentication, Verses, Socket) {
		$scope.authentication = Authentication;

		/*$scope.poem_name = '';*/
		$scope.showRecording = false;

		// Create new Verse
		$scope.create = function() {
			var lines = ($scope.lines.trim()).split('\n');
			var j = lines.length;
			while(j--){
				if(lines[j].trim()===''){
					lines.splice(j, 1);
				}
			}

			$scope.poem = [] ;
			for(var i = 0; i < lines.length; i++){
				$scope.poem.push({line: lines[i], line_index: i, line_sound_buffer: [0], line_duration: 0})
			}

			// Create new Verse object
			var verse = new Verses ({
				poem_name: $scope.poem_name,
				poem: $scope.poem
			});

			// Redirect after save
			verse.$save(function(response) {
				// response это тоn же экземпляр объекта идущий с сервера
				$scope.showRecording = true;
				//$location.path('verses/' + response._id);
				// Clear form fields if needed
				$scope.rec_buttons = $window.document.getElementsByClassName('recButtons');

				$scope.verse = Verses.get({
					verseId: response._id
				});

				$scope.error = null;

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				$scope.showRecording = false;
			});
		};

		// Remove existing Verse
		$scope.remove = function(verse) {
			if ( verse ) { 
				verse.$remove();

				for (var i in $scope.verses) {
					if ($scope.verses [i] === verse) {
						$scope.verses.splice(i, 1);
					}
				}
			} else {
				$scope.verse.$remove(function() {
					$location.path('verses');
				});
			}
		};

		// Update existing Verse
		$scope.update = function() {
			var verse = $scope.verse;

			verse.$update(function() {
				$location.path('verses/' + verse._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Verses
		$scope.find = function() {
			$scope.verses = Verses.query();
		};

		// Find existing Verse
		$scope.findOne = function() {
			$scope.verse = Verses.get({ 
				verseId: $stateParams.verseId
			});
		};

		$scope.startRecording = function($event){
			recorder && recorder.record();
			var button = $event.target;
			button.nextElementSibling.disabled = false;
			var len = $scope.rec_buttons.length;
			for(var i =0; i < len; i++){
				$scope.rec_buttons[i].disabled = true;
			}
			console.log('Recording...');
		};

		$scope.stopRecording = function($event, line_index){
			recorder && recorder.stop();
			var button = $event.target;
			button.disabled = true;
			console.log('Stopped recording.');
			var len = $scope.rec_buttons.length;
			for(var i =0; i < len; i++){
				$scope.rec_buttons[i].disabled = false;
			}

			$scope.line_index = parseInt(line_index);
			genRecordBuffer();
			recorder.clear();
		};

		function convert(n) {
			var v = n < 0 ? n * 32768 : n * 32767;       // convert in range [-32768, 32767]
			return Math.max(-32768, Math.min(32767, v)); // clamp
		}

		function reverseConvert(n) {
			var v = n < 0 ? n / 32768 : n / 32767;       // convert in range [-32768, 32767]
			return v;
		}

		function genRecordBuffer() {
			recorder && recorder.getBuffer(function(bufferArrays) {
				var arr = bufferArrays[0];
				var len = arr.length, i = 0, j=0;
				var temp = new Int16Array(len);
				while(i < len){
					temp[i] = convert(arr[i++]);
				}

				console.log(temp);
				console.log(temp.length);

				var poem_length = $scope.poem.length;

				for(var j = 0; j < poem_length; j++){
					if(j=== $scope.line_index){
						//запись сокетами
						Socket.emit('sound bites', {sound_bites: temp, line_index: $scope.line_index, verseId: $scope.verse._id} , function(cbdata){
							console.log(cbdata);
						}) ;
						// если всё ок с записью по вебсокетам, то записываем в scope
						//$scope.poem[j].line_sound_buffer = temp;
					}
				}

				/*var temp2 = new Float32Array(len);
				while(j < len){
					temp2[j] = reverseConvert(temp[j++]);
				}
				console.log(temp2) ;
				$timeout(getBufferCallback(temp2), 5000) ; // выбрасывает error*/
			});
		}

		function getBufferCallback(buffer) {
			var newSource = audio_context.createBufferSource();
			var newBuffer = audio_context.createBuffer( 2, buffer.length, audio_context.sampleRate );
			newBuffer.getChannelData(0).set(buffer);
			newBuffer.getChannelData(1).set(buffer);
			newSource.buffer = newBuffer;

			newSource.connect(audio_context.destination );
			newSource.start(0);
		}
	}
]);
