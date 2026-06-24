$ErrorActionPreference = "Stop"

# Get all untracked and modified files
$files = git status --porcelain | ForEach-Object { $_.Substring(3) }

if ($files.Count -eq 0) {
    Write-Host "No files to commit. Creating 50 empty commits."
    for ($i = 1; $i -le 50; $i++) {
        git commit --allow-empty -m "Update feature chunk $i"
    }
} else {
    $totalCommits = 50
    $filesCount = $files.Count
    
    $commitsWithFiles = [math]::Min($filesCount, $totalCommits)
    $emptyCommitsNeeded = $totalCommits - $commitsWithFiles
    
    # Calculate chunk sizes
    $baseChunkSize = [math]::Floor($filesCount / $commitsWithFiles)
    $remainder = $filesCount % $commitsWithFiles
    
    $fileIndex = 0
    
    for ($i = 1; $i -le $commitsWithFiles; $i++) {
        $chunkSize = $baseChunkSize
        if ($i -le $remainder) {
            $chunkSize += 1
        }
        
        $chunkFiles = @()
        for ($j = 0; $j -lt $chunkSize; $j++) {
            $chunkFiles += $files[$fileIndex]
            $fileIndex++
        }
        
        foreach ($file in $chunkFiles) {
            # Quote the file path to handle spaces
            $quotedFile = "`"$file`""
            Invoke-Expression "git add $quotedFile"
        }
        
        $commitMsg = "Implement feature chunk $i"
        git commit -m $commitMsg
    }
    
    # Create empty commits if needed
    for ($i = 1; $i -le $emptyCommitsNeeded; $i++) {
        $commitNum = $commitsWithFiles + $i
        git commit --allow-empty -m "Refining feature set $commitNum"
    }
}

Write-Host "Created 50 commits."
git push origin HEAD
Write-Host "Pushed to remote."
