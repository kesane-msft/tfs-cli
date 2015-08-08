/// <reference path="../../definitions/vso-node-api/vso-node-api.d.ts"/>

import cm = require('./common');
import cnm = require('./connection');
import apim = require('vso-node-api/WebApi');
import argm = require('./arguments');
var trace = require('./trace');

/*
 * formats lists of optional and required arguments for a command into a standard output for the command help
 * eg: 'args: <required1> <required2> [--optional1 <optional1>] [--optional2 <optional2>]' 
 * @param requiredArguments an array of the names of all arguments that are required
 * @param requiredArguments an array of the names of all arguments that can be optionally provided
 * @param flags boolean flags (optional because less frequently used) eg "--all"
 */
export function formatArgumentsHint(requiredArguments: argm.Argument[], 
    optionalArguments: argm.Argument[], 
    flags?: argm.Argument[]
    ): string {
        
    var argumentsHint: string = "";
    for (var i = 0; i < requiredArguments.length; i++) {
        argumentsHint += ' <' + requiredArguments[i].friendlyName + '>';
    }
    for (var i = 0; i < optionalArguments.length; i++) {
        argumentsHint += ' [--' + optionalArguments[i].name + ' <' + optionalArguments[i].friendlyName + '>]';
    }
    argumentsHint += ' [options]'
    return argumentsHint;
}

export class TfCommand {
    public connection: cnm.TfsConnection;
    public requiredArguments: argm.Argument[] = [];
    public optionalArguments: argm.Argument[] = [];
    public flags: argm.Argument[] = [];
    
    // setConnection

    // getWebApi() 
    public getWebApi(): apim.WebApi {
        return new apim.WebApi(this.connection.collectionUrl, this.connection.authHandler);
    }
    
    public getArguments(): string {
        return formatArgumentsHint(this.requiredArguments, this.optionalArguments, this.flags);
    }

    //
    // should return a JSON data object which will be
    // - printed in json if --json, or
    // - passed back to output for readable text
    //
    public exec(args: string[], options: cm.IOptions): Q.Promise<any> {
        var defer = Q.defer();
        trace('Unimplemented command');
        defer.reject(new Error('Not implemented.  Must override'));
        return <Q.Promise<any>>defer.promise;
    }

    public output(data: any): void {
        // should override and output to console results
        // in readable text based on data from exec call
    }
    
    public checkArguments(args: string[], options: cm.IOptions): { [name: string]: any } {
        var allArguments: { [name: string]: any } = {};
        for(var i = 0; i < this.requiredArguments.length; i++) {
            var name: string = this.requiredArguments[i].name;
            allArguments[name] = args[i] || options[name] || this.requiredArguments[i].defaultValue;
            this._checkRequiredArgument(allArguments[name], this.requiredArguments[i]);
        }
        var rest: argm.Argument[] = this.optionalArguments.concat(this.flags);
        for(var i = 0; i < rest.length; i++) {
            var name: string = rest[i].name;
            allArguments[name] = options[name] || rest[i].defaultValue;
        }
        return allArguments;
    }

    /*
     * throws an error if a required argument was not provided with a command 
     */
    private _checkRequiredArgument(parameterValue: any, argument: argm.Argument): void {
        if(!parameterValue) {
            trace('Missing required parameter ' + argument.name);
            throw new Error('Required parameter ' + argument.name + ' not supplied. Try adding a switch to the end of your command: --' + argument.name + ' <' + argument.friendlyName + '>');
        }
    }
}