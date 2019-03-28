//==============================================================================
/**
@file       colorPI.js
@brief      Philips Hue Plugin
@copyright  (c) 2019, Corsair Memory, Inc.
            This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

function ColorPI(inContext, inLanguage) {
    // Init ColorPI
    var instance = this;

    // Inherit from PI
    PI.call(this, inContext, inLanguage);

    // Add event listener
    document.getElementById("light-select").addEventListener("change", lightChanged);

    // Color changed
    function colorChanged(inEvent) {
        // Get the selected color
        var color = inEvent.target.value;

        // If the color is hex
        if (color.charAt(0) == '#') {
            // Convert the color to HSV
            var hsv = Bridge.hex2hsv(color);

            // Check if the color is valid
            if (hsv.v != 1) {
                // Remove brightness component
                hsv.v = 1;
                var correctedHSV = Bridge.hsv2hex(hsv);

                // Set the color to the corrected color
                color = correctedHSV;
            }
        }

        // Save the new color
        settings.color = color;
        instance.saveSettings();

        // Inform the plugin that a new color is set
        instance.sendToPlugin({ 'piEvent': 'valueChanged' });
    }

    // Light changed
    function lightChanged(inEvent) {
        // Get the light value manually
        // Because it is not set if this function was triggered via a CustomEvent
        var lightID = document.getElementById("light-select").value;

        // Don't show any color picker if no light or group is set
        if (lightID == "no-lights" || lightID == "no-groups") {
            return;
        }

        // Check if any bridge is configured
        if (!('bridge' in settings)) {
            return;
        }

        // Check if the configured bridge is in the cache
        if (!(settings.bridge in cache)) {
            return;
        }

        // Find the configured bridge
        var bridgeCache = cache[settings.bridge];

        // Check if the selected light or group is in the cache
				if (!(lightID in bridgeCache.lights || lightID in bridgeCache.groups)) {
						return;
				}

        // Get light or group cache
        if (lightID.indexOf('l') !== -1) {
            var lightCache = bridgeCache.lights[lightID];
        }
        else {
            var lightCache = bridgeCache.groups[lightID];
        }

        // Add full color picker or only temperature slider
        if (lightCache.xy != null) {
            var colorPicker = "<div type='color' class='sdpi-item'> \
                                  <div class='sdpi-item-label' id='color-label'>" + localization["Color"] + "</div> \
                                  <input type='color' class='sdpi-item-value' id='color-input' value='" + settings.color + "'> \
                               </div>";
        }
        else {
            var colorPicker = "<div type='range' class='sdpi-item'> \
                                   <div class='sdpi-item-label' id='temperature-label'>" + localization["Temperature"] + "</div> \
                                   <div class='sdpi-item-value'> \
                                        <input class='temperature' type='range' id='color-input' min='0' max='100' value='" + settings.color + "'> \
                                   </div> \
                              </div>";
        }

        // Add color picker
        document.getElementById('placeholder').innerHTML = colorPicker;

        // Add event listener
        document.getElementById("color-input").addEventListener("change", colorChanged);
    }
}
