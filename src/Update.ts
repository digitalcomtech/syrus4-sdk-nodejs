import * as Utils from "./Utils"

/**
 * Update module check for update and make update for ApexOS
 * @module Update
 */

/**
 * Check if an update is available in the dctserver for OS apps and return a list of the latest version of the packages
 */
function checkOS() {
	return Utils.OSExecute("apx-os-update", "check");
}


export default {
	checkOS
};
