import os
import sys
import re

from lib import tools_lib as Tools

def Main (argv):
	toolsDir = os.path.dirname (os.path.abspath (__file__))
	rootDir = os.path.dirname (toolsDir)
	os.chdir (rootDir)

	engineFiles = []
	sourceFolder = os.path.join (rootDir, 'source', 'engine')
	for dirName in os.listdir (sourceFolder):
		dirPath = os.path.join (sourceFolder, dirName)
		if not os.path.isdir (dirPath):
			continue
		for fileName in os.listdir (dirPath):
			engineFiles.append ({
				'dirName': dirName,
				'fileName': fileName
			})

	mainFilePath = os.path.join (sourceFolder, 'main.js')
	eolChar = Tools.GetEOLCharFromFile (mainFilePath)

	exportedSymbols = []
	mainFileContent = ''
	for engineFile in engineFiles:
		engineFilePath = os.path.join (sourceFolder, engineFile['dirName'], engineFile['fileName'])
		content = Tools.GetFileContent (engineFilePath)
		matches = re.findall ('export class ([a-zA-Z0-9]+)', content)
		matches.extend (re.findall ('export function ([a-zA-Z0-9]+)', content))
		matches.extend (re.findall ('export const ([a-zA-Z0-9]+)', content))
		matches.extend (re.findall ('export let ([a-zA-Z0-9]+)', content))
		if len (matches) == 0:
			continue
		relativePath = './' + engineFile['dirName'] + '/' + engineFile['fileName']
		mainFileContent += 'import { ' + ', '.join (matches) + ' } from \'' + relativePath + '\';' + eolChar
		for match in matches:
			exportedSymbols.append (match)

	mainFileContent += eolChar + 'export {' + eolChar
	for i in range (0, len (exportedSymbols)):
		exportedSymbol = exportedSymbols[i]
		mainFileContent += '    ' + exportedSymbol
		if i < len (exportedSymbols) - 1:
			mainFileContent += ','
		mainFileContent += eolChar
	mainFileContent += '};' + eolChar

	Tools.WriteContentToFile (mainFilePath, mainFileContent)
	return 0

sys.exit (Main (sys.argv))
