import Vapor
import Leaf

@MainActor var letters: [String : Letter] = [:]

// configures your application
public func configure(_ app: Application) async throws {
    // uncomment to serve files from /Public folder
     app.middleware.use(FileMiddleware(publicDirectory: app.directory.publicDirectory))
    // register routes
    app.views.use(.leaf)
    
    
    await generateLetters()
    
    
    try routes(app)
}



@MainActor func generateLetters() {
    for i in 0..<26 {
        let letter = Letter(index: i)
        letters[letter.char] = letter
    }
}

struct Letter: Codable {
    var char: String
    
    var x: Double
    
    var y: Double
    
    var color: String
    
    init(index: Int) {
        self.char = String(
            Character(
                UnicodeScalar(
                    65 + UInt8(
                        floor(
                            Double.random(in: 0..<26)
                        )
                    )
                )
            )
        )
        self.x = Double.random(in: 0...(800-50))
        
        self.y = Double.random(in: 0...(600-50))
        
        self.color = "hsl\(Double.random(in: 0...360)), 100%, 50%"
    }
}

func lettersToJSON(_ letters: [Letter]) -> String {
    let encoder = JSONEncoder()
    encoder.outputFormatting = .withoutEscapingSlashes // Optional: for pretty printing
    let jsonData = try! encoder.encode(letters)
    
    // Convert jsonData to a String for display
    let jsonString = String(data: jsonData, encoding: .utf8)
    print(jsonString)
    return jsonString ?? ""
    
}

func letterToJSON(_ letter: Letter) -> String {
    let encoder = JSONEncoder()
    encoder.outputFormatting = .withoutEscapingSlashes // Optional: for pretty printing
    let jsonData = try! encoder.encode(letter)
    
    // Convert jsonData to a String for display
    let jsonString = String(data: jsonData, encoding: .utf8)
    print(jsonString)
    return jsonString ?? ""
    
}
