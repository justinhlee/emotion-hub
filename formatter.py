import sys


emotions = ['anger', 'anticipation', 'disgust', 'fear'
            , 'joy', 'negative', 'positive', 'sadness'
            , 'surprise', 'trust']


def read_top_words(file_path):
    top_words = []
    f = open(file_path, 'r')
    for line in f:
        if len(line.split()) == 1:
            top_words.append(line.split()[0].lower())
    f.close()
    return top_words


def map_unigrams(query, top_words):
    feature_vector = []
    words_in_file = {}
    query_words = query.split()
    for word in query_words:
        if word in words_in_file:
            words_in_file[word] = words_in_file[word] + 1
        else:
            words_in_file[word] = 1
    for word in top_words:
        if word in words_in_file:
            feature_vector.append(words_in_file[word])
        else:
            feature_vector.append(0)
    return feature_vector


def format_to_libsvm(feature_vector, is_label):
    values = ''
    for i in range(len(feature_vector)):
        if feature_vector[i] > 0:
            values += str(i+1) + ':' + str(feature_vector[i]) + ' '
    if is_label:
        values = '+1 ' + values
    else:
        values = '-1 ' + values
    return values
    

def main(input):
    #open input and read query
    query = ''
    f = open(input[0], 'r')
    for line in f:
        query += line
    print query
    top_words = read_top_words('top_words.txt')
    feature_vector = map_unigrams(query, top_words)
    towrite = open('input.t', 'w')
    towrite.write(format_to_libsvm(feature_vector, True))
   

if __name__ == "__main__":
    main(sys.argv[1:])
