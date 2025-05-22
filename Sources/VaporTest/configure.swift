import Vapor
import Leaf

@MainActor var letters: [Letter] = []

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
        letters.append(Letter(index: i))
    }
}

struct Letter: Codable {
    let char: String
    
    var x: String
    
    var y: String
    
    let color: String
    
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
        self.x = String(Double.random(in: 0...(800-50)))
        
        self.y = String(Double.random(in: 0...(600-50)))
        
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
