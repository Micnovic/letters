//
//  JSONConverters.swift
//  VaporTest
//
//  Created by Михновец Глеб on 25.05.2025.
//

import Foundation

func JSONToStruct<T>(_ jsonString: String) -> T? where T: Decodable {
    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .useDefaultKeys
 
    do {
        let customStruct = try JSONDecoder().decode(T.self, from: jsonString.data(using: .utf8)!)
        return customStruct
    } catch {
        print("Error decoding JSON: \(error)")
    }
    
    return nil
}

func structToJSON<T>(_ genericStruct: T) -> String where T: Encodable {
    let encoder = JSONEncoder()
    encoder.outputFormatting = .withoutEscapingSlashes // Optional: for pretty printing
    let jsonData = try! encoder.encode(genericStruct)
    
    // Convert jsonData to a String for display
    let jsonString = String(data: jsonData, encoding: .utf8)!
    return jsonString
}

@MainActor func save<T>(data: T, to file: String) where T: Encodable {
    let encoder = JSONEncoder()
    do {
        let jsonData = try encoder.encode(data)
        let fileURL = URL(fileURLWithPath: file)
        try jsonData.write(to: fileURL)
        print("Data saved to \(fileURL)")
    } catch {
        print("Error encoding or saving data: \(error)")
    }
}


@MainActor func load<T>(from file: String) -> T? where T: Decodable {
    do {
        let fileContents = try String(contentsOfFile: file, encoding: .utf8)
        
        let JSONStringFromFile: T = JSONToStruct(fileContents)!
        
        print("Data loaded from \(file)")
        
        return JSONStringFromFile
    } catch {
        print("Error encoding or loading data: \(error)")
        return nil
    }
}
